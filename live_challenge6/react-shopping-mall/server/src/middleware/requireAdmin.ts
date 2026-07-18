import type {
    NextFunction,
    Request,
    Response,
} from 'express';

import { db } from '../db/database';
import type { AccessTokenPayload } from '../utils/token';

interface AdminUserRow {
    id: number;
    role: 'user' | 'admin';
}

export function requireAdmin(
    _request: Request,
    response: Response,
    next: NextFunction,
): void {
    const auth = response.locals.auth as
        | AccessTokenPayload
        | undefined;

    if (!auth) {
        response.status(401).json({
            success: false,
            message: '로그인 정보가 없습니다.',
        });
        return;
    }

    const user = db
        .prepare(`
            SELECT
                id,
                role
            FROM users
            WHERE id = ?
        `)
        .get(auth.userId) as AdminUserRow | undefined;

    if (!user) {
        response.status(401).json({
            success: false,
            message: '인증된 사용자를 찾을 수 없습니다.',
        });
        return;
    }

    if (user.role !== 'admin') {
        response.status(403).json({
            success: false,
            message: '관리자 권한이 필요합니다.',
        });
        return;
    }

    next();
}
