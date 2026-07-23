import { describe, expect, it } from 'vitest';

import authReducer, {
  checkSession,
  continueAsGuest,
  returnToLogin,
} from './authSlice';

describe('authSlice', () => {
  it('인증 확인 후 게스트 상태로 전환한다', () => {
    const state = authReducer(undefined, continueAsGuest());

    expect(state.status).toBe('guest');
    expect(state.user).toBeNull();
  });

  it('로그인한 사용자와 역할을 저장한다', () => {
    const user = {
      id: 'admin-1',
      email: 'admin@example.test',
      displayName: '관리자',
      role: 'admin' as const,
      mustChangePassword: false,
    };
    const state = authReducer(
      undefined,
      checkSession.fulfilled(user, 'request-1', undefined),
    );

    expect(state.status).toBe('authenticated');
    expect(state.user?.role).toBe('admin');
  });

  it('게스트가 로그인 화면으로 돌아간다', () => {
    const guestState = authReducer(undefined, continueAsGuest());
    const state = authReducer(guestState, returnToLogin());

    expect(state.status).toBe('anonymous');
  });
});
