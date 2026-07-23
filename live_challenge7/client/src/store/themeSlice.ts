import { createSlice } from '@reduxjs/toolkit';

import {
  loadTheme,
  type ThemeMode,
} from '../storage/themeStorage';

interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: loadTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
