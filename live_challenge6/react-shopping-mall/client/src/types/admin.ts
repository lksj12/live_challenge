import type { UserRole } from './auth';

export interface AdminUser {
    id: number;
    email: string;
    nickname: string;
    role: UserRole;
    mustChangePassword: boolean;
    createdAt: string;
    orderCount: number;
}

export interface AdminUserListResponse {
    success: true;
    users: AdminUser[];
}

export interface ResetPasswordResponse {
    success: true;
    message: string;
    temporaryPassword: string;
}

export interface DeleteUserResponse {
    success: true;
    message: string;
}
