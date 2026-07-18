import type {
    NextFunction,
    Request,
    Response,
} from 'express';

import { verifyAccessToken } from '../utils/token';

export function authenticate(
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    const authorization = request.headers.authorization;

    if (!authorization) {
        response.status(401).json({
            success: false,
            message: '인증 토큰이 필요합니다.',
        });
        return;
    }

    const parts = authorization.trim().split(/\s+/);
    const scheme = parts[0];
    const token = parts[1];

    if (
        parts.length !== 2
        || scheme.toLowerCase() !== 'bearer'
        || !token
    ) {
        response.status(401).json({
            success: false,
            message: '올바른 형식의 인증 토큰이 필요합니다.',
        });
        return;
    }

    try {
        response.locals.auth = verifyAccessToken(token);
        next();
    } catch {
        response.status(401).json({
            success: false,
            message: '인증 토큰이 유효하지 않거나 만료되었습니다.',
        });
    }
}
