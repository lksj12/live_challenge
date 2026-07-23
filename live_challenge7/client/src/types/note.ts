export type NotePriority = 'low' | 'medium' | 'high';

export type NoteStatus = 'active' | 'archived' | 'trashed';

export interface Note {
  id: string;
  ownerId: string | null;
  title: string;
  content: string;
  color: string;
  priority: NotePriority;
  status: NoteStatus;
  isPinned: boolean;
  tags: string[];
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export type NoteSort =
  | 'updated-desc'
  | 'created-desc'
  | 'priority-asc'
  | 'priority-desc';

export type NotesLoadState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface CreateNoteInput {
  title: string;
  content: string;
  color?: string;
  priority?: NotePriority;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  color?: string;
  priority?: NotePriority;
  isPinned?: boolean;
  status?: NoteStatus;
}
