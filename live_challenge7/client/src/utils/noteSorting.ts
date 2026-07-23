import type { Note, NotePriority, NoteSort } from '../types/note';

const PRIORITY_ORDER: Record<NotePriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

export function compareNotes(
  left: Note,
  right: Note,
  sortBy: NoteSort,
): number {
  if (sortBy === 'created-desc') {
    return Date.parse(right.createdAt) - Date.parse(left.createdAt);
  }
  if (sortBy === 'priority-asc') {
    return PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority];
  }
  if (sortBy === 'priority-desc') {
    return PRIORITY_ORDER[right.priority] - PRIORITY_ORDER[left.priority];
  }
  return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
}
