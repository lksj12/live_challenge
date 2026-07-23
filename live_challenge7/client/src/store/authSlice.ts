import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  fetchCurrentUser,
  login,
  logout,
  register,
} from '../api/authApi';
import type {
  AuthStatus,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from '../types/auth';

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'checking',
  isSubmitting: false,
  error: null,
};

export const checkSession = createAsyncThunk(
  'auth/checkSession',
  fetchCurrentUser,
);

export const loginUser = createAsyncThunk(
  'auth/login',
  (credentials: LoginCredentials) => login(credentials),
);

export const registerUser = createAsyncThunk(
  'auth/register',
  (credentials: RegisterCredentials) => register(credentials),
);

export const logoutUser = createAsyncThunk('auth/logout', logout);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    continueAsGuest(state) {
      state.user = null;
      state.status = 'guest';
      state.error = null;
    },
    returnToLogin(state) {
      state.user = null;
      state.status = 'anonymous';
      state.error = null;
    },
    dismissAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkSession.pending, (state) => {
        state.status = 'checking';
        state.error = null;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status =
          action.payload === null ? 'anonymous' : 'authenticated';
      })
      .addCase(checkSession.rejected, (state) => {
        state.user = null;
        state.status = 'failed';
        state.error = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';
      })
      .addCase(loginUser.pending, startSubmitting)
      .addCase(loginUser.fulfilled, finishAuthentication)
      .addCase(loginUser.rejected, failAuthentication)
      .addCase(registerUser.pending, startSubmitting)
      .addCase(registerUser.fulfilled, finishAuthentication)
      .addCase(registerUser.rejected, failAuthentication)
      .addCase(logoutUser.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = 'anonymous';
        state.isSubmitting = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error =
          action.error.message ??
          '로그아웃하지 못했습니다. 다시 시도해 주세요.';
      });
  },
});

function startSubmitting(state: AuthState): void {
  state.isSubmitting = true;
  state.error = null;
}

function finishAuthentication(
  state: AuthState,
  action: { payload: AuthUser },
): void {
  state.user = action.payload;
  state.status = 'authenticated';
  state.isSubmitting = false;
  state.error = null;
}

function failAuthentication(
  state: AuthState,
  action: { error: { message?: string } },
): void {
  state.isSubmitting = false;
  state.error = action.error.message ?? '인증 요청을 처리하지 못했습니다.';
}

export const { continueAsGuest, dismissAuthError, returnToLogin } =
  authSlice.actions;

export default authSlice.reducer;
