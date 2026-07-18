export type UserRole =
    | 'user'
    | 'admin';

export interface AuthUser {
    id: number;
    email: string;
    nickname: string;
    role: UserRole;
    mustChangePassword: boolean;
    createdAt: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    nickname: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface ChangePasswordCredentials {
    currentPassword: string;
    newPassword: string;
}

export interface DeleteAccountCredentials {
    password: string;
}

export interface RegisterResponse {
    success: true;
    message: string;
    user: AuthUser;
}

export interface LoginResponse {
    success: true;
    message: string;
    token: string;
    user: AuthUser;
}

export interface CurrentUserResponse {
    success: true;
    user: AuthUser;
}

export interface ChangePasswordResponse {
    success: true;
    message: string;
}

export interface DeleteAccountResponse {
    success: true;
    message: string;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
}
