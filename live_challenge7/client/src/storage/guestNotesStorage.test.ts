import { describe, expect, it } from 'vitest';

import { parseGuestNotes, saveGuestNotes } from './guestNotesStorage';
import type { Note } from '../types/note';

const guestNote: Note = {
  id: 'guest-1',
  ownerId: null,
  title: '비회원 노트',
  content: '현재 탭에서만 보관',
  color: '#f7d774',
  priority: 'medium',
  status: 'active',
  isPinned: false,
  tags: [],
  sizeBytes: 32,
  createdAt: '2026-07-23T00:00:00.000Z',
  updatedAt: '2026-07-23T00:00:00.000Z',
};

describe('guestNotesStorage', () => {
  it('유효한 비회원 노트만 복원한다', () => {
    const memberNote = { ...guestNote, id: 'member-1', ownerId: 'user-1' };
    const parsed = parseGuestNotes(
      JSON.stringify([guestNote, memberNote, { title: '불완전한 데이터' }]),
    );

    expect(parsed).toEqual([guestNote]);
  });

  it('손상된 저장 데이터는 빈 목록으로 처리한다', () => {
    expect(parseGuestNotes('{broken')).toEqual([]);
    expect(parseGuestNotes(null)).toEqual([]);
  });

  it('스토리지 접근 오류를 호출부로 전파하지 않는다', () => {
    const brokenStorage = {
      setItem: () => {
        throw new Error('quota');
      },
    };

    expect(saveGuestNotes([guestNote], brokenStorage)).toBe(false);
  });
});
