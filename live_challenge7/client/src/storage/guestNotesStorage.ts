import type { Note } from '../types/note';

const GUEST_NOTES_KEY = 'keeply.guestNotes.v1';

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isGuestNote(value: unknown): value is Note {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    value.ownerId === null &&
    typeof value.title === 'string' &&
    typeof value.content === 'string' &&
    typeof value.color === 'string' &&
    ['low', 'medium', 'high'].includes(String(value.priority)) &&
    ['active', 'archived', 'trashed'].includes(String(value.status)) &&
    typeof value.isPinned === 'boolean' &&
    Array.isArray(value.tags) &&
    value.tags.every((tag) => typeof tag === 'string') &&
    typeof value.sizeBytes === 'number' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  );
}

export function parseGuestNotes(rawValue: string | null): Note[] {
  if (rawValue === null) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed.filter(isGuestNote) : [];
  } catch {
    return [];
  }
}

export function loadGuestNotes(
  storage: ReadableStorage = window.sessionStorage,
): Note[] {
  try {
    return parseGuestNotes(storage.getItem(GUEST_NOTES_KEY));
  } catch {
    return [];
  }
}

export function saveGuestNotes(
  notes: Note[],
  storage: WritableStorage = window.sessionStorage,
): boolean {
  try {
    storage.setItem(GUEST_NOTES_KEY, JSON.stringify(notes));
    return true;
  } catch {
    return false;
  }
}
