import type { ManagedUser } from '../types/admin';

interface UsersResponse {
  users: ManagedUser[];
}

interface ErrorResponse {
  error?: {
    message?: string;
  };
}

export async function fetchManagedUsers(): Promise<ManagedUser[]> {
  const response = await fetch('/api/admin/users', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw await createApiError(response);
  }
  const body = (await response.json()) as UsersResponse;
  return body.users;
}

export async function resetManagedUserPassword(
  userId: string,
  newPassword: string,
): Promise<void> {
  const response = await fetch(
    `/api/admin/users/${userId}/reset-password`,
    {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPassword }),
    },
  );
  if (!response.ok) {
    throw await createApiError(response);
  }
}

export async function deleteManagedUser(userId: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw await createApiError(response);
  }
}

async function createApiError(response: Response): Promise<Error> {
  let message = '관리자 요청을 처리하지 못했습니다.';
  try {
    const body = (await response.json()) as ErrorResponse;
    if (typeof body.error?.message === 'string') {
      message = body.error.message;
    }
  } catch {
    // Keep the fallback for an empty or non-JSON response.
  }
  return new Error(message);
}
