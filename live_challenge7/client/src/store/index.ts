import {
  configureStore,
  createListenerMiddleware,
  isAnyOf,
} from '@reduxjs/toolkit';

import { saveGuestNotes } from '../storage/guestNotesStorage';
import { saveTheme } from '../storage/themeStorage';
import type { Note } from '../types/note';
import authReducer from './authSlice';
import adminReducer from './adminSlice';
import notesReducer, {
  addGuestNote,
  deleteGuestNote,
  updateGuestNote,
} from './notesSlice';
import tagsReducer from './tagsSlice';
import themeReducer, { toggleTheme } from './themeSlice';

const guestNotesListener = createListenerMiddleware();

guestNotesListener.startListening({
  matcher: isAnyOf(addGuestNote, updateGuestNote, deleteGuestNote),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as {
      notes: { guestItems: Note[] };
    };
    saveGuestNotes(state.notes.guestItems);
  },
});

guestNotesListener.startListening({
  actionCreator: toggleTheme,
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as {
      theme: { mode: 'light' | 'dark' };
    };
    saveTheme(state.theme.mode);
  },
});

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    auth: authReducer,
    notes: notesReducer,
    tags: tagsReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(guestNotesListener.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
