import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { findUserBySessionTokenHash } from './users.js';
import { toPublicUser } from './types.js';
export const SESSION_COOKIE_NAME = 'keeply_session';
const SESSION_LIFETIME_MS = 12 * 60 * 60 * 1_000;
const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1_000;
export function buildSession(now = new Date()) {
    const token = randomBytes(32).toString('base64url');
    return {
        id: randomUUID(),
        token,
        tokenHash: hashSessionToken(token),
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + SESSION_LIFETIME_MS).toISOString(),
    };
}
export function insertSession(database, userId, session) {
    database
        .prepare(`INSERT INTO sessions (
        id,
        user_id,
        token_hash,
        created_at,
        last_seen_at,
        expires_at
      ) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(session.id, userId, session.tokenHash, session.createdAt, session.createdAt, session.expiresAt);
}
export function readSessionToken(request) {
    const cookies = request.cookies;
    const token = cookies[SESSION_COOKIE_NAME];
    return typeof token === 'string' && token.length > 0 ? token : null;
}
export function authenticateSession(database, token, now = new Date()) {
    const tokenHash = hashSessionToken(token);
    const nowIso = now.toISOString();
    const idleCutoff = new Date(now.getTime() - SESSION_IDLE_TIMEOUT_MS).toISOString();
    const result = findUserBySessionTokenHash(database, tokenHash, nowIso, idleCutoff);
    if (result === null) {
        database
            .prepare(`UPDATE sessions
         SET revoked_at = COALESCE(revoked_at, ?)
         WHERE token_hash = ?`)
            .run(nowIso, tokenHash);
        return null;
    }
    database
        .prepare('UPDATE sessions SET last_seen_at = ? WHERE id = ?')
        .run(nowIso, result.sessionId);
    return {
        sessionId: result.sessionId,
        user: toPublicUser(result.user),
    };
}
export function revokeSession(database, token, now = new Date()) {
    database
        .prepare(`UPDATE sessions
       SET revoked_at = COALESCE(revoked_at, ?)
       WHERE token_hash = ?`)
        .run(now.toISOString(), hashSessionToken(token));
}
export function setSessionCookie(response, session, secure) {
    response.cookie(SESSION_COOKIE_NAME, session.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure,
        path: '/',
        expires: new Date(session.expiresAt),
    });
}
export function clearSessionCookie(response, secure) {
    response.clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: true,
        sameSite: 'lax',
        secure,
        path: '/',
    });
}
function hashSessionToken(token) {
    return createHash('sha256').update(token).digest('hex');
}
//# sourceMappingURL=session.js.map