import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import {
  createNote,
  deleteNotePermanently,
  fetchNotes,
  setNoteTags,
  trashNote,
  updateNote,
} from '../api/notesApi';
import type {
  CreateNoteInput,
  Note,
  NoteSort,
  NotesLoadState,
  NoteStatus,
  UpdateNoteInput,
} from '../types/note';
import {
  loginUser,
  logoutUser,
  registerUser,
} from './authSlice';

type MutationState = 'idle' | 'saving' | 'deleting';

interface NotesState {
  items: Note[];
  guestItems: Note[];
  selectedNoteId: string | null;
  query: string;
  activeTag: string | null;
  activeStatus: NoteStatus;
  sortBy: NoteSort;
  loadState: NotesLoadState;
  mutationState: MutationState;
  error: string | null;
}

const initialState: NotesState = {
  items: [],
  guestItems: [],
  selectedNoteId: null,
  query: '',
  activeTag: null,
  activeStatus: 'active',
  sortBy: 'updated-desc',
  loadState: 'idle',
  mutationState: 'idle',
  error: null,
};

export const fetchMemberNotes = createAsyncThunk(
  'notes/fetchMemberNotes',
  (status: NoteStatus = 'active') => fetchNotes(status),
);

export const createMemberNote = createAsyncThunk(
  'notes/createMemberNote',
  (input: CreateNoteInput) => createNote(input),
);

export const updateMemberNote = createAsyncThunk(
  'notes/updateMemberNote',
  ({ noteId, input }: { noteId: string; input: UpdateNoteInput }) =>
    updateNote(noteId, input),
);

export const trashMemberNote = createAsyncThunk(
  'notes/trashMemberNote',
  async (noteId: string) => {
    await trashNote(noteId);
    return noteId;
  },
);

export const setMemberNoteTags = createAsyncThunk(
  'notes/setMemberNoteTags',
  ({ noteId, tagIds }: { noteId: string; tagIds: string[] }) =>
    setNoteTags(noteId, tagIds),
);

export const permanentlyDeleteMemberNote = createAsyncThunk(
  'notes/permanentlyDeleteMemberNote',
  async (noteId: string) => {
    await deleteNotePermanently(noteId);
    return noteId;
  },
);

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setSelectedNote(state, action: PayloadAction<string | null>) {
      state.selectedNoteId = action.payload;
    },
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    setActiveTag(state, action: PayloadAction<string | null>) {
      state.activeTag = action.payload;
    },
    setActiveStatus(state, action: PayloadAction<NoteStatus>) {
      state.activeStatus = action.payload;
      state.selectedNoteId = null;
    },
    setSortBy(state, action: PayloadAction<NoteSort>) {
      state.sortBy = action.payload;
    },
    setLoadState(state, action: PayloadAction<NotesLoadState>) {
      state.loadState = action.payload;
    },
    setNotes(state, action: PayloadAction<Note[]>) {
      state.items = action.payload;
      state.loadState = 'succeeded';
      state.error = null;
    },
    setGuestNotes(state, action: PayloadAction<Note[]>) {
      state.guestItems = action.payload;
    },
    addGuestNote(state, action: PayloadAction<Note>) {
      state.guestItems.unshift(action.payload);
    },
    updateGuestNote(state, action: PayloadAction<Note>) {
      const index = state.guestItems.findIndex(
        (note) => note.id === action.payload.id,
      );
      if (index !== -1) {
        state.guestItems[index] = action.payload;
      }
    },
    deleteGuestNote(state, action: PayloadAction<string>) {
      state.guestItems = state.guestItems.filter(
        (note) => note.id !== action.payload,
      );
      if (state.selectedNoteId === action.payload) {
        state.selectedNoteId = null;
      }
    },
    setNotesError(state, action: PayloadAction<string>) {
      state.loadState = 'failed';
      state.error = action.payload;
    },
    clearNotesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMemberNotes.pending, (state) => {
        state.loadState = 'loading';
        state.error = null;
      })
      .addCase(fetchMemberNotes.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loadState = 'succeeded';
      })
      .addCase(fetchMemberNotes.rejected, (state, action) => {
        state.loadState = 'failed';
        state.error =
          action.error.message ?? '노트를 불러오지 못했습니다.';
      })
      .addCase(createMemberNote.pending, (state) => {
        state.mutationState = 'saving';
        state.error = null;
      })
      .addCase(createMemberNote.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.mutationState = 'idle';
      })
      .addCase(createMemberNote.rejected, failMutation)
      .addCase(updateMemberNote.pending, (state) => {
        state.mutationState = 'saving';
        state.error = null;
      })
      .addCase(updateMemberNote.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (note) => note.id === action.payload.id,
        );
        if (
          index !== -1 &&
          action.payload.status === state.activeStatus
        ) {
          state.items[index] = action.payload;
        } else if (index !== -1) {
          state.items.splice(index, 1);
        }
        state.mutationState = 'idle';
      })
      .addCase(updateMemberNote.rejected, failMutation)
      .addCase(setMemberNoteTags.pending, (state) => {
        state.mutationState = 'saving';
        state.error = null;
      })
      .addCase(setMemberNoteTags.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (note) => note.id === action.payload.id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.mutationState = 'idle';
      })
      .addCase(setMemberNoteTags.rejected, failMutation)
      .addCase(trashMemberNote.pending, (state) => {
        state.mutationState = 'deleting';
        state.error = null;
      })
      .addCase(trashMemberNote.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (note) => note.id !== action.payload,
        );
        if (state.selectedNoteId === action.payload) {
          state.selectedNoteId = null;
        }
        state.mutationState = 'idle';
      })
      .addCase(trashMemberNote.rejected, failMutation)
      .addCase(permanentlyDeleteMemberNote.pending, (state) => {
        state.mutationState = 'deleting';
        state.error = null;
      })
      .addCase(permanentlyDeleteMemberNote.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (note) => note.id !== action.payload,
        );
        state.mutationState = 'idle';
      })
      .addCase(permanentlyDeleteMemberNote.rejected, failMutation)
      .addCase(loginUser.fulfilled, resetMemberNotes)
      .addCase(registerUser.fulfilled, resetMemberNotes)
      .addCase(logoutUser.fulfilled, resetMemberNotes);
  },
});

function failMutation(
  state: NotesState,
  action: { error: { message?: string } },
): void {
  state.mutationState = 'idle';
  state.error = action.error.message ?? '노트를 저장하지 못했습니다.';
}

function resetMemberNotes(state: NotesState): void {
  state.items = [];
  state.selectedNoteId = null;
  state.activeTag = null;
  state.loadState = 'idle';
  state.mutationState = 'idle';
  state.error = null;
}

export const {
  addGuestNote,
  clearNotesError,
  deleteGuestNote,
  setActiveStatus,
  setActiveTag,
  setGuestNotes,
  setLoadState,
  setNotes,
  setNotesError,
  setQuery,
  setSelectedNote,
  setSortBy,
  updateGuestNote,
} = notesSlice.actions;

export default notesSlice.reducer;
