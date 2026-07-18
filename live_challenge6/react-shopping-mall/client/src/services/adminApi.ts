import { requestJson } from './authApi';
import type {
    AdminUserListResponse,
    DeleteUserResponse,
    ResetPasswordResponse,
} from '../types/admin';

function createAuthorizationHeader(
    token: string,
): HeadersInit {
    return {
        Authorization: `Bearer ${token}`,
    };
}

export function fetchAdminUsers(
    token: string,
): Promise<AdminUserListResponse> {
    return requestJson<AdminUserListResponse>(
        '/api/admin/users',
        {
            method: 'GET',
            headers:
                createAuthorizationHeader(token),
        },
    );
}

export function resetUserPassword(
    token: string,
    userId: number,
): Promise<ResetPasswordResponse> {
    return requestJson<ResetPasswordResponse>(
        `/api/admin/users/${userId}/reset-password`,
        {
            method: 'PATCH',
            headers:
                createAuthorizationHeader(token),
        },
    );
}

export function deleteUserByAdmin(
    token: string,
    userId: number,
): Promise<DeleteUserResponse> {
    return requestJson<DeleteUserResponse>(
        `/api/admin/users/${userId}`,
        {
            method: 'DELETE',
            headers:
                createAuthorizationHeader(token),
        },
    );
}
