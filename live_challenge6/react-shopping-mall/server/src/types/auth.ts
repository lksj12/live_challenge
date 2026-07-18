export type UserRole = 'user' | 'admin';

export interface RegisterRequestBody {
    email: string;
    password: string;
    nickname: string;
}

export interface LoginRequestBody {
    email: string;
    password: string;
}

export interface ChangePasswordRequestBody {
    currentPassword: string;
    newPassword: string;
}

export interface DeleteAccountRequestBody {
    password: string;
}

export interface PublicUser {
    id: number;
    email: string;
    nickname: string;
    role: UserRole;
    mustChangePassword: boolean;
    createdAt: string;
}
