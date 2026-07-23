import type {
  CreateNoteInput,
  Note,
  NoteStatus,
  UpdateNoteInput,
} from '../types/note';

interface NotesResponse {
  notes: Note[];
}

interface NoteResponse {
  note: Note;
}

interface ErrorResponse {
  error?: {
    message?: string;
  };
}

export async function fetchNotes(status: NoteStatus = 'active'): Promise<Note[]> {
  const response = await fetch(`/api/notes?status=${status}`, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  const body = (await response.json()) as NotesResponse;
  return body.notes;
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const response = await fetch('/api/notes', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  return readNote(response);
}

export async function updateNote(
  noteId: string,
  input: UpdateNoteInput,
): Promise<Note> {
  const response = await fetch(`/api/notes/${noteId}`, {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  return readNote(response);
}

export async function trashNote(noteId: string): Promise<void> {
  const response = await fetch(`/api/notes/${noteId}`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw await createApiError(response);
  }
}

export async function deleteNotePermanently(noteId: string): Promise<void> {
  const response = await fetch(`/api/notes/${noteId}/permanent`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw await createApiError(response);
  }
}

export async function setNoteTags(
  noteId: string,
  tagIds: string[],
): Promise<Note> {
  const response = await fetch(`/api/notes/${noteId}/tags`, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tagIds }),
  });

  return readNote(response);
}

async function readNote(response: Response): Promise<Note> {
  if (!response.ok) {
    throw await createApiError(response);
  }

  const body = (await response.json()) as NoteResponse;
  return body.note;
}

async function createApiError(response: Response): Promise<Error> {
  let message = '노트 요청을 처리하지 못했습니다.';

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
