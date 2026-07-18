import {
    createAsyncThunk,
    createSlice,
} from '@reduxjs/toolkit';

import type { RootState } from '../../app/store';
import {
    ApiRequestError,
    fetchCurrentUser,
    loginUser,
    registerUser,
} from '../../services/authApi';
import type {
    AuthUser,
    LoginCredentials,
    LoginResponse,
    RegisterCredentials,
    RegisterResponse,
} from '../../types/auth';

const tokenStorageKey = 'shopping_mall_auth_token';

export type AuthStatus =
    | 'idle'
    | 'loading'
    | 'succeeded'
    | 'failed';

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    status: AuthStatus;
    initialized: boolean;
    error: string | null;
    registrationMessage: string | null;
}

interface RestoreSessionPayload {
    user: AuthUser | null;
    token: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    status: 'idle',
    initialized: false,
    error: null,
    registrationMessage: null,
};

function getErrorMessage(error: unknown): string {
    if (error instanceof ApiRequestError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return '알 수 없는 오류가 발생했습니다.';
}

export const registerAccount = createAsyncThunk<
    RegisterResponse,
    RegisterCredentials,
    {
        rejectValue: string;
    }
>(
    'auth/registerAccount',
    async (credentials, { rejectWithValue }) => {
        try {
            return await registerUser(credentials);
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
);

export const loginAccount = createAsyncThunk<
    LoginResponse,
    LoginCredentials,
    {
        rejectValue: string;
    }
>(
    'auth/loginAccount',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await loginUser(credentials);

            localStorage.setItem(
                tokenStorageKey,
                response.token,
            );

            return response;
        } catch (error) {
            return rejectWithValue(getErrorMessage(error));
        }
    },
);

export const restoreSession = createAsyncThunk<
    RestoreSessionPayload,
    void,
    {
        rejectValue: string;
    }
>(
    'auth/restoreSession',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem(tokenStorageKey);

        if (!token) {
            return {
                user: null,
                token: null,
            };
        }

        try {
            const response = await fetchCurrentUser(token);

            return {
                user: response.user,
                token,
            };
        } catch (error) {
            localStorage.removeItem(tokenStorageKey);

            return rejectWithValue(getErrorMessage(error));
        }
    },
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuthState(state) {
            state.user = null;
            state.token = null;
            state.status = 'idle';
            state.initialized = true;
            state.error = null;
            state.registrationMessage = null;
        },
        clearAuthError(state) {
            state.error = null;
        },
        clearRegistrationMessage(state) {
            state.registrationMessage = null;
        },
        markPasswordChangeCompleted(state) {
            if (state.user) {
                state.user.mustChangePassword = false;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerAccount.pending, (state) => {
                state.status = 'loading';
                state.error = null;
                state.registrationMessage = null;
            })
            .addCase(
                registerAccount.fulfilled,
                (state, action) => {
                    state.status = 'succeeded';
                    state.registrationMessage =
                        action.payload.message;
                },
            )
            .addCase(
                registerAccount.rejected,
                (state, action) => {
                    state.status = 'failed';
                    state.error =
                        action.payload
                        ?? '회원가입에 실패했습니다.';
                },
            )
            .addCase(loginAccount.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(
                loginAccount.fulfilled,
                (state, action) => {
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    state.status = 'succeeded';
                    state.initialized = true;
                    state.error = null;
                },
            )
            .addCase(
                loginAccount.rejected,
                (state, action) => {
                    state.user = null;
                    state.token = null;
                    state.status = 'failed';
                    state.initialized = true;
                    state.error =
                        action.payload
                        ?? '로그인에 실패했습니다.';
                },
            )
            .addCase(restoreSession.pending, (state) => {
                state.status = 'loading';
                state.initialized = false;
                state.error = null;
            })
            .addCase(
                restoreSession.fulfilled,
                (state, action) => {
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                    state.status = 'succeeded';
                    state.initialized = true;
                    state.error = null;
                },
            )
            .addCase(
                restoreSession.rejected,
                (state, action) => {
                    state.user = null;
                    state.token = null;
                    state.status = 'failed';
                    state.initialized = true;
                    state.error =
                        action.payload
                        ?? '로그인 상태를 확인하지 못했습니다.';
                },
            );
    },
});

export const {
    clearAuthError,
    clearAuthState,
    clearRegistrationMessage,
    markPasswordChangeCompleted,
} = authSlice.actions;

export function logout() {
    localStorage.removeItem(tokenStorageKey);

    return clearAuthState();
}

export const selectCurrentUser = (state: RootState) =>
    state.auth.user;

export const selectAuthToken = (state: RootState) =>
    state.auth.token;

export const selectAuthStatus = (state: RootState) =>
    state.auth.status;

export const selectAuthInitialized = (state: RootState) =>
    state.auth.initialized;

export const selectAuthError = (state: RootState) =>
    state.auth.error;

export const selectRegistrationMessage = (state: RootState) =>
    state.auth.registrationMessage;

export const selectIsAuthenticated = (state: RootState) =>
    state.auth.user !== null && state.auth.token !== null;

export default authSlice.reducer;
