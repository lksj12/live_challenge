import bcrypt from 'bcryptjs';
import type {
    Request,
    Response,
} from 'express';

import { db } from '../db/database';
import type {
    ChangePasswordRequestBody,
    DeleteAccountRequestBody,
    UserRole,
} from '../types/auth';
import type { AccessTokenPayload } from '../utils/token';

interface UserRow {
    id: number;
    email: string;
    password_hash: string;
    nickname: string;
    role: UserRole;
    must_change_password: number;
    created_at: string;
}

function getAuthenticatedUserId(
    response: Response,
): number | null {
    const auth = response.locals.auth as
        | AccessTokenPayload
        | undefined;

    if (!auth) {
        response.status(401).json({
            success: false,
            message: '로그인 정보가 없습니다.',
        });

        return null;
    }

    return auth.userId;
}

function findUserById(userId: number): UserRow | undefined {
    return db
        .prepare(`
            SELECT
                id,
                email,
                password_hash,
                nickname,
                role,
                must_change_password,
                created_at
            FROM users
            WHERE id = ?
        `)
        .get(userId) as UserRow | undefined;
}

function isValidNewPassword(password: string): boolean {
    return (
        password.length >= 8
        && Buffer.byteLength(password, 'utf8') <= 72
    );
}

export function getCurrentUser(
    _request: Request,
    response: Response,
): void {
    const userId = getAuthenticatedUserId(response);

    if (userId === null) {
        return;
    }

    const user = findUserById(userId);

    if (!user) {
        response.status(401).json({
            success: false,
            message: '인증된 사용자를 찾을 수 없습니다.',
        });
        return;
    }

    response.status(200).json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            role: user.role,
            mustChangePassword:
                user.must_change_password === 1,
            createdAt: user.created_at,
        },
    });
}

export async function changePassword(
    request: Request,
    response: Response,
): Promise<void> {
    const userId = getAuthenticatedUserId(response);

    if (userId === null) {
        return;
    }

    const body =
        request.body as Partial<ChangePasswordRequestBody>;

    const currentPassword =
        typeof body.currentPassword === 'string'
            ? body.currentPassword
            : '';

    const newPassword =
        typeof body.newPassword === 'string'
            ? body.newPassword
            : '';

    if (!currentPassword || !newPassword) {
        response.status(400).json({
            success: false,
            message:
                '현재 비밀번호와 새 비밀번호를 모두 입력해 주세요.',
        });
        return;
    }

    if (!isValidNewPassword(newPassword)) {
        response.status(400).json({
            success: false,
            message:
                '새 비밀번호는 8자 이상이며 너무 길지 않아야 합니다.',
        });
        return;
    }

    if (currentPassword === newPassword) {
        response.status(400).json({
            success: false,
            message:
                '새 비밀번호는 현재 비밀번호와 다르게 입력해 주세요.',
        });
        return;
    }

    const user = findUserById(userId);

    if (!user) {
        response.status(404).json({
            success: false,
            message: '사용자 정보를 찾을 수 없습니다.',
        });
        return;
    }

    try {
        const passwordMatches = await bcrypt.compare(
            currentPassword,
            user.password_hash,
        );

        if (!passwordMatches) {
            response.status(401).json({
                success: false,
                message:
                    '현재 비밀번호가 올바르지 않습니다.',
            });
            return;
        }

        const newPasswordHash = await bcrypt.hash(
            newPassword,
            12,
        );

        db.prepare(`
            UPDATE users
            SET
                password_hash = ?,
                must_change_password = 0
            WHERE id = ?
        `).run(
            newPasswordHash,
            user.id,
        );

        response.status(200).json({
            success: true,
            message: '비밀번호가 변경되었습니다.',
        });
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);

        response.status(500).json({
            success: false,
            message:
                '비밀번호 변경 중 오류가 발생했습니다.',
        });
    }
}

export async function deleteAccount(
    request: Request,
    response: Response,
): Promise<void> {
    const userId = getAuthenticatedUserId(response);

    if (userId === null) {
        return;
    }

    const body =
        request.body as Partial<DeleteAccountRequestBody>;

    const password =
        typeof body.password === 'string'
            ? body.password
            : '';

    if (!password) {
        response.status(400).json({
            success: false,
            message:
                '회원 탈퇴를 위해 비밀번호를 입력해 주세요.',
        });
        return;
    }

    const user = findUserById(userId);

    if (!user) {
        response.status(404).json({
            success: false,
            message: '사용자 정보를 찾을 수 없습니다.',
        });
        return;
    }

    if (user.role === 'admin') {
        response.status(403).json({
            success: false,
            message:
                '관리자 계정은 일반 회원 탈퇴 기능으로 삭제할 수 없습니다.',
        });
        return;
    }

    try {
        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash,
        );

        if (!passwordMatches) {
            response.status(401).json({
                success: false,
                message: '비밀번호가 올바르지 않습니다.',
            });
            return;
        }

        const deleteUser = db.transaction(() => {
            db.prepare(`
                DELETE FROM users
                WHERE id = ?
            `).run(user.id);
        });

        deleteUser();

        response.status(200).json({
            success: true,
            message: '회원 탈퇴가 완료되었습니다.',
        });
    } catch (error) {
        console.error('회원 탈퇴 오류:', error);

        response.status(500).json({
            success: false,
            message:
                '회원 탈퇴 처리 중 오류가 발생했습니다.',
        });
    }
}
