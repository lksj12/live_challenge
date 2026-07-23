import type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from '../types/auth';

interface AuthResponse {
  user: AuthUser;
}

interface ErrorResponse {
  error?: {
    message?: string;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch('/api/auth/session', {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  });

  if (response.status === 401) {
    return null;
  }

  return readAuthResponse(response);
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthUser> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  return readAuthResponse(response);
}

export async function register(
  credentials: RegisterCredentials,
): Promise<AuthUser> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  return readAuthResponse(response);
}

export async function logout(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw await toApiError(response);
  }
}

async function readAuthResponse(response: Response): Promise<AuthUser> {
  if (!response.ok) {
    throw await toApiError(response);
  }

  const body = (await response.json()) as AuthResponse;
  return body.user;
}

async function toApiError(response: Response): Promise<ApiError> {
  let message = '요청을 처리하지 못했습니다.';

  try {
    const body = (await response.json()) as ErrorResponse;
    if (typeof body.error?.message === 'string') {
      message = body.error.message;
    }
  } catch {
    // The fallback message is used for non-JSON error responses.
  }

  return new ApiError(message, response.status);
}
