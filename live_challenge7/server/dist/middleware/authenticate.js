import { authenticateSession, readSessionToken, } from '../auth/session.js';
export function requireAuthentication(database) {
    return (request, response, next) => {
        const token = readSessionToken(request);
        const auth = token === null ? null : authenticateSession(database, token);
        if (auth === null) {
            response.status(401).json({
                error: {
                    code: 'AUTHENTICATION_REQUIRED',
                    message: '로그인이 필요합니다.',
                },
            });
            return;
        }
        request.auth = auth;
        next();
    };
}
//# sourceMappingURL=authenticate.js.map