import { randomBytes } from 'node:crypto';

import bcrypt from 'bcryptjs';
import type {
    Request,
    Response,
} from 'express';

import { db } from '../db/database';
import type { UserRole } from '../types/auth';

interface AdminUserRow {
    id: number;
    email: string;
    nickname: string;
    role: UserRole;
    must_change_password: number;
    created_at: string;
    order_count: number;
}

interface UserRoleRow {
    id: number;
    role: UserRole;
}

function parseUserId(
    value: string | string[] | undefined,
): number | null {
    const normalizedValue = Array.isArray(value)
        ? value[0]
        : value;

    if (!normalizedValue) {
        return null;
    }

    const userId = Number(normalizedValue);

    if (
        !Number.isInteger(userId)
        || userId <= 0
    ) {
        return null;
    }

    return userId;
}

export function listUsers(
    _request: Request,
    response: Response,
): void {
    try {
        const users = db
            .prepare(`
                SELECT
                    users.id,
                    users.email,
                    users.nickname,
                    users.role,
                    users.must_change_password,
                    users.created_at,
                    COUNT(orders.id) AS order_count
                FROM users
                LEFT JOIN orders
                    ON orders.user_id = users.id
                GROUP BY users.id
                ORDER BY
                    CASE
                        WHEN users.role = 'admin' THEN 0
                        ELSE 1
                    END,
                    users.id ASC
            `)
            .all() as AdminUserRow[];

        response.status(200).json({
            success: true,
            users: users.map((user) => ({
                id: user.id,
                email: user.email,
                nickname: user.nickname,
                role: user.role,
                mustChangePassword:
                    user.must_change_password === 1,
                createdAt: user.created_at,
                orderCount: user.order_count,
            })),
        });
    } catch (error) {
        console.error(
            '사용자 목록 조회 오류:',
            error,
        );

        response.status(500).json({
            success: false,
            message:
                '사용자 목록을 불러오는 중 오류가 발생했습니다.',
        });
    }
}

export async function resetUserPassword(
    request: Request,
    response: Response,
): Promise<void> {
    const userId = parseUserId(
        request.params.userId,
    );

    if (userId === null) {
        response.status(400).json({
            success: false,
            message:
                '올바른 사용자 번호가 필요합니다.',
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
        .get(userId) as UserRoleRow | undefined;

    if (!user) {
        response.status(404).json({
            success: false,
            message: '사용자를 찾을 수 없습니다.',
        });
        return;
    }

    if (user.role === 'admin') {
        response.status(403).json({
            success: false,
            message:
                '관리자 계정의 비밀번호는 초기화할 수 없습니다.',
        });
        return;
    }

    try {
        const temporaryPassword =
            `Temp-${randomBytes(6).toString('hex')}`;

        const passwordHash = await bcrypt.hash(
            temporaryPassword,
            12,
        );

        db.prepare(`
            UPDATE users
            SET
                password_hash = ?,
                must_change_password = 1
            WHERE id = ?
        `).run(
            passwordHash,
            user.id,
        );

        response.status(200).json({
            success: true,
            message:
                '비밀번호가 임시 비밀번호로 초기화되었습니다.',
            temporaryPassword,
        });
    } catch (error) {
        console.error(
            '비밀번호 초기화 오류:',
            error,
        );

        response.status(500).json({
            success: false,
            message:
                '비밀번호 초기화 중 오류가 발생했습니다.',
        });
    }
}

export function deleteUserByAdmin(
    request: Request,
    response: Response,
): void {
    const userId = parseUserId(
        request.params.userId,
    );

    if (userId === null) {
        response.status(400).json({
            success: false,
            message:
                '올바른 사용자 번호가 필요합니다.',
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
        .get(userId) as UserRoleRow | undefined;

    if (!user) {
        response.status(404).json({
            success: false,
            message: '사용자를 찾을 수 없습니다.',
        });
        return;
    }

    if (user.role === 'admin') {
        response.status(403).json({
            success: false,
            message:
                '관리자 계정은 삭제할 수 없습니다.',
        });
        return;
    }

    try {
        const result = db
            .prepare(`
                DELETE FROM users
                WHERE id = ?
            `)
            .run(user.id);

        if (result.changes !== 1) {
            response.status(404).json({
                success: false,
                message:
                    '사용자를 찾을 수 없습니다.',
            });
            return;
        }

        response.status(200).json({
            success: true,
            message:
                '사용자 계정과 구매 내역을 삭제했습니다.',
        });
    } catch (error) {
        console.error(
            '관리자 사용자 삭제 오류:',
            error,
        );

        response.status(500).json({
            success: false,
            message:
                '사용자 삭제 중 오류가 발생했습니다.',
        });
    }
}
