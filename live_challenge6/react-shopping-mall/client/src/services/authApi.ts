import type {
    ApiErrorResponse,
    ChangePasswordCredentials,
    ChangePasswordResponse,
    CurrentUserResponse,
    DeleteAccountCredentials,
    DeleteAccountResponse,
    LoginCredentials,
    LoginResponse,
    RegisterCredentials,
    RegisterResponse,
} from '../types/auth';

const rawApiBaseUrl =
    import.meta.env.VITE_API_BASE_URL;

if (!rawApiBaseUrl) {
    throw new Error(
        'VITE_API_BASE_URL 환경변수가 필요합니다.',
    );
}

const apiBaseUrl =
    rawApiBaseUrl.replace(/\/$/, '');

export class ApiRequestError extends Error {
    readonly status: number;

    constructor(
        message: string,
        status: number,
    ) {
        super(message);

        this.name = 'ApiRequestError';
        this.status = status;
    }
}

function isApiErrorResponse(
    value: unknown,
): value is ApiErrorResponse {
    if (
        typeof value !== 'object'
        || value === null
        || !('success' in value)
        || !('message' in value)
    ) {
        return false;
    }

    return (
        value.success === false
        && typeof value.message === 'string'
    );
}

export async function requestJson<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers =
        new Headers(options.headers);

    if (
        options.body
        && !headers.has('Content-Type')
    ) {
        headers.set(
            'Content-Type',
            'application/json',
        );
    }

    const response = await fetch(
        `${apiBaseUrl}${path}`,
        {
            ...options,
            headers,
        },
    );

    let responseData: unknown = null;

    try {
        responseData =
            await response.json();
    } catch {
        responseData = null;
    }

    if (!response.ok) {
        const message =
            isApiErrorResponse(responseData)
                ? responseData.message
                : '서버 요청을 처리하지 못했습니다.';

        throw new ApiRequestError(
            message,
            response.status,
        );
    }

    return responseData as T;
}

export function registerUser(
    credentials: RegisterCredentials,
): Promise<RegisterResponse> {
    return requestJson<RegisterResponse>(
        '/api/auth/register',
        {
            method: 'POST',
            body: JSON.stringify(
                credentials,
            ),
        },
    );
}

export function loginUser(
    credentials: LoginCredentials,
): Promise<LoginResponse> {
    return requestJson<LoginResponse>(
        '/api/auth/login',
        {
            method: 'POST',
            body: JSON.stringify(
                credentials,
            ),
        },
    );
}

export function fetchCurrentUser(
    token: string,
): Promise<CurrentUserResponse> {
    return requestJson<CurrentUserResponse>(
        '/api/auth/me',
        {
            method: 'GET',
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        },
    );
}

export function changeUserPassword(
    token: string,
    credentials: ChangePasswordCredentials,
): Promise<ChangePasswordResponse> {
    return requestJson<ChangePasswordResponse>(
        '/api/auth/change-password',
        {
            method: 'PATCH',
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
            body: JSON.stringify(
                credentials,
            ),
        },
    );
}

export function deleteUserAccount(
    token: string,
    credentials: DeleteAccountCredentials,
): Promise<DeleteAccountResponse> {
    return requestJson<DeleteAccountResponse>(
        '/api/auth/account',
        {
            method: 'DELETE',
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
            body: JSON.stringify(
                credentials,
            ),
        },
    );
}
