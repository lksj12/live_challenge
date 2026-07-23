import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  deleteManagedUser,
  fetchManagedUsers,
  resetManagedUserPassword,
} from '../api/adminApi';
import type { ManagedUser } from '../types/admin';
import { logoutUser } from './authSlice';

interface AdminState {
  users: ManagedUser[];
  loadState: 'idle' | 'loading' | 'succeeded' | 'failed';
  mutationState: 'idle' | 'resetting' | 'deleting';
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  loadState: 'idle',
  mutationState: 'idle',
  error: null,
};

export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  fetchManagedUsers,
);

export const resetAdminUserPassword = createAsyncThunk(
  'admin/resetPassword',
  ({ userId, newPassword }: { userId: string; newPassword: string }) =>
    resetManagedUserPassword(userId, newPassword),
);

export const deleteAdminUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId: string) => {
    await deleteManagedUser(userId);
    return userId;
  },
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loadState = 'loading';
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loadState = 'succeeded';
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loadState = 'failed';
        state.error =
          action.error.message ?? '사용자 목록을 불러오지 못했습니다.';
      })
      .addCase(resetAdminUserPassword.pending, (state) => {
        state.mutationState = 'resetting';
        state.error = null;
      })
      .addCase(resetAdminUserPassword.fulfilled, (state) => {
        state.mutationState = 'idle';
      })
      .addCase(resetAdminUserPassword.rejected, failMutation)
      .addCase(deleteAdminUser.pending, (state) => {
        state.mutationState = 'deleting';
        state.error = null;
      })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.users = state.users.filter(
          (user) => user.id !== action.payload,
        );
        state.mutationState = 'idle';
      })
      .addCase(deleteAdminUser.rejected, failMutation)
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

function failMutation(
  state: AdminState,
  action: { error: { message?: string } },
): void {
  state.mutationState = 'idle';
  state.error = action.error.message ?? '관리자 요청을 처리하지 못했습니다.';
}

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
