import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { buildSession, clearSessionCookie, insertSession, readSessionToken, revokeSession, setSessionCookie, } from '../auth/session.js';
import { toPublicUser } from '../auth/types.js';
import { findUserByEmail } from '../auth/users.js';
import { requireAuthentication } from '../middleware/authenticate.js';
const registerSchema = z.object({
    email: z.string().trim().email().max(254),
    displayName: z.string().trim().min(2).max(50),
    password: z.string().min(10).max(128),
});
const loginSchema = z.object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(128),
});
const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1_000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
        },
    },
});
export function createAuthRouter(database, options) {
    const router = Router();
    router.use((_request, response, next) => {
        response.setHeader('Cache-Control', 'no-store');
        next();
    });
    router.post('/register', authRateLimit, async (request, response) => {
        const parsed = registerSchema.safeParse(request.body);
        if (!parsed.success) {
            respondValidationError(response);
            return;
        }
        const email = parsed.data.email.toLowerCase();
        if (findUserByEmail(database, email) !== null) {
            response.status(409).json({
                error: {
                    code: 'EMAIL_ALREADY_EXISTS',
                    message: '이미 사용 중인 이메일입니다.',
                },
            });
            return;
        }
        const now = new Date().toISOString();
        const userId = randomUUID();
        const passwordHash = await hashPassword(parsed.data.password);
        const session = buildSession(new Date(now));
        const createUserAndSession = database.transaction(() => {
            database
                .prepare(`INSERT INTO users (
            id,
            email,
            display_name,
            password_hash,
            role,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, 'user', ?, ?)`)
                .run(userId, email, parsed.data.displayName, passwordHash, now, now);
            insertSession(database, userId, session);
        });
        createUserAndSession();
        setSessionCookie(response, session, options.secureCookies);
        response.status(201).json({
            user: {
                id: userId,
                email,
                displayName: parsed.data.displayName,
                role: 'user',
                mustChangePassword: false,
            },
        });
    });
    router.post('/login', authRateLimit, async (request, response) => {
        const parsed = loginSchema.safeParse(request.body);
        if (!parsed.success) {
            respondValidationError(response);
            return;
        }
        const user = findUserByEmail(database, parsed.data.email.toLowerCase());
        const passwordMatches = user === null
            ? false
            : await verifyPassword(user.passwordHash, parsed.data.password);
        if (user === null || !passwordMatches) {
            response.status(401).json({
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
                },
            });
            return;
        }
        if (user.status !== 'active') {
            response.status(403).json({
                error: {
                    code: 'ACCOUNT_DISABLED',
                    message: '사용이 중지된 계정입니다.',
                },
            });
            return;
        }
        const session = buildSession();
        const updateLoginAndCreateSession = database.transaction(() => {
            insertSession(database, user.id, session);
            database
                .prepare('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?')
                .run(session.createdAt, session.createdAt, user.id);
        });
        updateLoginAndCreateSession();
        setSessionCookie(response, session, options.secureCookies);
        response.json({
            user: toPublicUser(user),
        });
    });
    router.get('/session', requireAuthentication(database), (request, response) => {
        response.json({
            user: request.auth?.user,
        });
    });
    router.post('/logout', (request, response) => {
        const token = readSessionToken(request);
        if (token !== null) {
            revokeSession(database, token);
        }
        clearSessionCookie(response, options.secureCookies);
        response.status(204).end();
    });
    return router;
}
function respondValidationError(response) {
    response.status(400).json({
        error: {
            code: 'VALIDATION_ERROR',
            message: '입력값을 다시 확인해 주세요.',
        },
    });
}
//# sourceMappingURL=auth.js.map