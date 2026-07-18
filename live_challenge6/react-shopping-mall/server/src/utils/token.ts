import jwt from 'jsonwebtoken';

export interface AccessTokenPayload {
    userId: number;
    email: string;
}

function getJwtSecret(): string {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error('JWT_SECRET 환경 변수가 설정되지 않았습니다.');
    }

    return jwtSecret;
}

export function createAccessToken(
    userId: number,
    email: string,
): string {
    const payload: AccessTokenPayload = {
        userId,
        email,
    };

    return jwt.sign(payload, getJwtSecret(), {
        algorithm: 'HS256',
        expiresIn: '1h',
    });
}

export function verifyAccessToken(
    token: string,
): AccessTokenPayload {
    const decoded = jwt.verify(token, getJwtSecret(), {
        algorithms: ['HS256'],
    });

    if (
        typeof decoded === 'string'
        || typeof decoded.userId !== 'number'
        || typeof decoded.email !== 'string'
    ) {
        throw new Error('올바르지 않은 인증 토큰입니다.');
    }

    return {
        userId: decoded.userId,
        email: decoded.email,
    };
}
