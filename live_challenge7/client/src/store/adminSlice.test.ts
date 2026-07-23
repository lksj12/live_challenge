import { describe, expect, it } from 'vitest';

import adminReducer, {
  deleteAdminUser,
  fetchAdminUsers,
} from './adminSlice';
import type { ManagedUser } from '../types/admin';

const user: ManagedUser = {
  id: 'user-1',
  email: 'user@example.test',
  displayName: '일반 사용자',
  status: 'active',
  lastLoginAt: null,
  createdAt: '2026-07-23T00:00:00.000Z',
  noteCount: 3,
  storageBytes: 1_024,
};

describe('adminSlice', () => {
  it('관리 대상 사용자와 사용량을 저장한다', () => {
    const state = adminReducer(
      undefined,
      fetchAdminUsers.fulfilled([user], 'request-1', undefined),
    );

    expect(state.users).toEqual([user]);
    expect(state.loadState).toBe('succeeded');
  });

  it('삭제된 사용자를 목록에서 제거한다', () => {
    const loaded = adminReducer(
      undefined,
      fetchAdminUsers.fulfilled([user], 'request-2', undefined),
    );
    const state = adminReducer(
      loaded,
      deleteAdminUser.fulfilled(user.id, 'request-3', user.id),
    );

    expect(state.users).toEqual([]);
    expect(state.mutationState).toBe('idle');
  });
});
