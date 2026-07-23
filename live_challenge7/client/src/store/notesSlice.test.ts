import { describe, expect, it } from 'vitest';

import notesReducer, {
  addGuestNote,
  createMemberNote,
  deleteGuestNote,
  permanentlyDeleteMemberNote,
  setActiveStatus,
  setGuestNotes,
  setLoadState,
  setNotes,
  setQuery,
  setSortBy,
  trashMemberNote,
  updateGuestNote,
  updateMemberNote,
} from './notesSlice';
import type { Note } from '../types/note';

const note: Note = {
  id: 'note-1',
  ownerId: 'user-1',
  title: '첫 노트',
  content: '기본 상태 테스트',
  color: '#f7d774',
  priority: 'medium',
  status: 'active',
  isPinned: false,
  tags: [],
  sizeBytes: 29,
  createdAt: '2026-07-23T00:00:00.000Z',
  updatedAt: '2026-07-23T00:00:00.000Z',
};

describe('notesSlice', () => {
  it('회원 노트 로딩 상태와 목록을 갱신한다', () => {
    const loadingState = notesReducer(undefined, setLoadState('loading'));
    const loadedState = notesReducer(loadingState, setNotes([note]));

    expect(loadingState.loadState).toBe('loading');
    expect(loadedState.items).toEqual([note]);
    expect(loadedState.loadState).toBe('succeeded');
  });

  it('게스트 노트와 회원 노트를 분리해서 보관한다', () => {
    const guestNote = { ...note, id: 'guest-1', ownerId: null };
    const state = notesReducer(undefined, setGuestNotes([guestNote]));

    expect(state.guestItems).toEqual([guestNote]);
    expect(state.items).toEqual([]);
  });

  it('게스트 노트를 생성, 수정, 삭제한다', () => {
    const guestNote = { ...note, id: 'guest-1', ownerId: null };
    const createdState = notesReducer(undefined, addGuestNote(guestNote));
    const changedGuestNote = {
      ...guestNote,
      title: '수정한 노트',
      updatedAt: '2026-07-23T01:00:00.000Z',
    };
    const updatedState = notesReducer(
      createdState,
      updateGuestNote(changedGuestNote),
    );
    const deletedState = notesReducer(
      updatedState,
      deleteGuestNote(guestNote.id),
    );

    expect(createdState.guestItems).toEqual([guestNote]);
    expect(updatedState.guestItems).toEqual([changedGuestNote]);
    expect(deletedState.guestItems).toEqual([]);
    expect(deletedState.items).toEqual([]);
  });

  it('검색어와 메뉴가 바뀌면 화면 상태만 갱신한다', () => {
    const queriedState = notesReducer(undefined, setQuery('회의'));
    const archivedState = notesReducer(
      queriedState,
      setActiveStatus('archived'),
    );

    expect(archivedState.query).toBe('회의');
    expect(archivedState.activeStatus).toBe('archived');
    expect(archivedState.items).toEqual([]);
  });

  it('정렬 기준을 Redux 상태에 보관한다', () => {
    const state = notesReducer(undefined, setSortBy('priority-desc'));

    expect(state.sortBy).toBe('priority-desc');
  });

  it('서버에서 생성된 노트를 목록 첫 번째에 추가한다', () => {
    const state = notesReducer(
      undefined,
      createMemberNote.fulfilled(
        note,
        'request-1',
        { title: note.title, content: note.content },
      ),
    );

    expect(state.items).toEqual([note]);
    expect(state.mutationState).toBe('idle');
  });

  it('휴지통으로 이동한 노트를 활성 목록에서 제거한다', () => {
    const loadedState = notesReducer(undefined, setNotes([note]));
    const state = notesReducer(
      loadedState,
      trashMemberNote.fulfilled(note.id, 'request-2', note.id),
    );

    expect(state.items).toEqual([]);
    expect(state.mutationState).toBe('idle');
  });

  it('다른 상태로 이동한 회원 노트를 현재 목록에서 제거한다', () => {
    const loadedState = notesReducer(undefined, setNotes([note]));
    const archivedNote = { ...note, status: 'archived' as const };
    const state = notesReducer(
      loadedState,
      updateMemberNote.fulfilled(
        archivedNote,
        'request-3',
        {
          noteId: note.id,
          input: { status: 'archived' },
        },
      ),
    );

    expect(state.items).toEqual([]);
  });

  it('영구 삭제된 노트를 휴지통 목록에서 제거한다', () => {
    const trashedNote = { ...note, status: 'trashed' as const };
    const trashState = notesReducer(
      notesReducer(undefined, setActiveStatus('trashed')),
      setNotes([trashedNote]),
    );
    const state = notesReducer(
      trashState,
      permanentlyDeleteMemberNote.fulfilled(
        note.id,
        'request-4',
        note.id,
      ),
    );

    expect(state.items).toEqual([]);
  });
});
