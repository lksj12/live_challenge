import bcrypt from 'bcryptjs';
import type {
    Request,
    Response,
} from 'express';

import { db } from '../db/database';
import type {
    LoginRequestBody,
    RegisterRequestBody,
    UserRole,
} from '../types/auth';
import { createAccessToken } from '../utils/token';

interface ExistingUserRow {
    id: number;
}

interface UserRow {
    id: number;
    email: string;
    password_hash: string;
    nickname: string;
    role: UserRole;
    must_change_password: number;
    created_at: string;
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isUniqueConstraintError(error: unknown): boolean {
    return (
        typeof error === 'object'
        && error !== null
        && 'code' in error
        && error.code === 'SQLITE_CONSTRAINT_UNIQUE'
    );
}

function isValidPassword(password: string): boolean {
    const passwordByteLength = Buffer.byteLength(
        password,
        'utf8',
    );

    return (
        password.length >= 8
        && passwordByteLength <= 72
    );
}

export async function register(
    request: Request,
    response: Response,
): Promise<void> {
    const body = request.body as Partial<RegisterRequestBody>;

    const email =
        typeof body.email === 'string'
            ? body.email.trim().toLowerCase()
            : '';

    const password =
        typeof body.password === 'string'
            ? body.password
            : '';

    const nickname =
        typeof body.nickname === 'string'
            ? body.nickname.trim()
            : '';

    if (!email || !password || !nickname) {
        response.status(400).json({
            success: false,
            message:
                '이메일, 비밀번호, 닉네임을 모두 입력해 주세요.',
        });
        return;
    }

    if (!isValidEmail(email)) {
        response.status(400).json({
            success: false,
            message: '올바른 이메일 형식을 입력해 주세요.',
        });
        return;
    }

    if (nickname.length < 2 || nickname.length > 20) {
        response.status(400).json({
            success: false,
            message:
                '닉네임은 2자 이상 20자 이하로 입력해 주세요.',
        });
        return;
    }

    if (password.length < 8) {
        response.status(400).json({
            success: false,
            message: '비밀번호는 8자 이상이어야 합니다.',
        });
        return;
    }

    if (!isValidPassword(password)) {
        response.status(400).json({
            success: false,
            message: '비밀번호가 너무 깁니다.',
        });
        return;
    }

    const existingUser = db
        .prepare(`
            SELECT id
            FROM users
            WHERE email = ?
        `)
        .get(email) as ExistingUserRow | undefined;

    if (existingUser) {
        response.status(409).json({
            success: false,
            message: '이미 가입된 이메일입니다.',
        });
        return;
    }

    try {
        const passwordHash = await bcrypt.hash(
            password,
            12,
        );

        const result = db
            .prepare(`
                INSERT INTO users (
                    email,
                    password_hash,
                    nickname,
                    role,
                    must_change_password
                )
                VALUES (?, ?, ?, 'user', 0)
            `)
            .run(
                email,
                passwordHash,
                nickname,
            );

        const createdUser = db
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
            .get(
                result.lastInsertRowid,
            ) as UserRow | undefined;

        if (!createdUser) {
            response.status(500).json({
                success: false,
                message:
                    '생성된 사용자 정보를 불러오지 못했습니다.',
            });
            return;
        }

        response.status(201).json({
            success: true,
            message: '회원가입이 완료되었습니다.',
            user: {
                id: createdUser.id,
                email: createdUser.email,
                nickname: createdUser.nickname,
                role: createdUser.role,
                mustChangePassword:
                    createdUser.must_change_password === 1,
                createdAt: createdUser.created_at,
            },
        });
    } catch (error) {
        if (isUniqueConstraintError(error)) {
            response.status(409).json({
                success: false,
                message: '이미 가입된 이메일입니다.',
            });
            return;
        }

        console.error('회원가입 오류:', error);

        response.status(500).json({
            success: false,
            message:
                '회원가입 처리 중 오류가 발생했습니다.',
        });
    }
}

export async function login(
    request: Request,
    response: Response,
): Promise<void> {
    const body = request.body as Partial<LoginRequestBody>;

    const email =
        typeof body.email === 'string'
            ? body.email.trim().toLowerCase()
            : '';

    const password =
        typeof body.password === 'string'
            ? body.password
            : '';

    if (!email || !password) {
        response.status(400).json({
            success: false,
            message:
                '이메일과 비밀번호를 모두 입력해 주세요.',
        });
        return;
    }

    const user = db
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
            WHERE email = ?
        `)
        .get(email) as UserRow | undefined;

    if (!user) {
        response.status(401).json({
            success: false,
            message:
                '이메일 또는 비밀번호가 올바르지 않습니다.',
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
                message:
                    '이메일 또는 비밀번호가 올바르지 않습니다.',
            });
            return;
        }

        const token = createAccessToken(
            user.id,
            user.email,
        );

        response.status(200).json({
            success: true,
            message: '로그인되었습니다.',
            token,
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
    } catch (error) {
        console.error('로그인 오류:', error);

        response.status(500).json({
            success: false,
            message:
                '로그인 처리 중 오류가 발생했습니다.',
        });
    }
}
