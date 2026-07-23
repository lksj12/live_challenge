import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { createTag, fetchTags } from '../api/tagsApi';
import type { Tag } from '../types/note';
import { loginUser, logoutUser, registerUser } from './authSlice';

interface TagsState {
  items: Tag[];
  loadState: 'idle' | 'loading' | 'succeeded' | 'failed';
  mutationState: 'idle' | 'saving';
  error: string | null;
}

const initialState: TagsState = {
  items: [],
  loadState: 'idle',
  mutationState: 'idle',
  error: null,
};

export const fetchMemberTags = createAsyncThunk(
  'tags/fetchMemberTags',
  fetchTags,
);

export const createMemberTag = createAsyncThunk(
  'tags/createMemberTag',
  (name: string) => createTag(name),
);

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearTagsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMemberTags.pending, (state) => {
        state.loadState = 'loading';
        state.error = null;
      })
      .addCase(fetchMemberTags.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loadState = 'succeeded';
      })
      .addCase(fetchMemberTags.rejected, (state, action) => {
        state.loadState = 'failed';
        state.error =
          action.error.message ?? '태그를 불러오지 못했습니다.';
      })
      .addCase(createMemberTag.pending, (state) => {
        state.mutationState = 'saving';
        state.error = null;
      })
      .addCase(createMemberTag.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.items.sort((left, right) =>
          left.name.localeCompare(right.name, 'ko'),
        );
        state.mutationState = 'idle';
      })
      .addCase(createMemberTag.rejected, (state, action) => {
        state.mutationState = 'idle';
        state.error =
          action.error.message ?? '태그를 만들지 못했습니다.';
      })
      .addCase(loginUser.fulfilled, resetTags)
      .addCase(registerUser.fulfilled, resetTags)
      .addCase(logoutUser.fulfilled, resetTags);
  },
});

function resetTags(state: TagsState): void {
  state.items = [];
  state.loadState = 'idle';
  state.mutationState = 'idle';
  state.error = null;
}

export const { clearTagsError } = tagsSlice.actions;
export default tagsSlice.reducer;
