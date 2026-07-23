import type { Tag } from '../types/note';

interface TagsResponse {
  tags: Tag[];
}

interface TagResponse {
  tag: Tag;
}

interface ErrorResponse {
  error?: {
    message?: string;
  };
}

export async function fetchTags(): Promise<Tag[]> {
  const response = await fetch('/api/tags', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  const body = (await response.json()) as TagsResponse;
  return body.tags;
}

export async function createTag(name: string): Promise<Tag> {
  const response = await fetch('/api/tags', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  const body = (await response.json()) as TagResponse;
  return body.tag;
}

async function createApiError(response: Response): Promise<Error> {
  let message = '태그 요청을 처리하지 못했습니다.';

  try {
    const body = (await response.json()) as ErrorResponse;
    if (typeof body.error?.message === 'string') {
      message = body.error.message;
    }
  } catch {
    // Keep the fallback message for non-JSON errors.
  }

  return new Error(message);
}
