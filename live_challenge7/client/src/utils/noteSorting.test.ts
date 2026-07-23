import { describe, expect, it } from 'vitest';

import { compareNotes } from './noteSorting';
import type { Note } from '../types/note';

const lowPriorityNote: Note = {
  id: 'low',
  ownerId: null,
  title: '낮은 우선순위',
  content: '',
  color: '#bcd8f4',
  priority: 'low',
  status: 'active',
  isPinned: false,
  tags: [],
  sizeBytes: 0,
  createdAt: '2026-07-22T00:00:00.000Z',
  updatedAt: '2026-07-23T00:00:00.000Z',
};

const highPriorityNote: Note = {
  ...lowPriorityNote,
  id: 'high',
  priority: 'high',
  createdAt: '2026-07-23T00:00:00.000Z',
  updatedAt: '2026-07-24T00:00:00.000Z',
};

describe('compareNotes', () => {
  it('수정일과 생성일의 최신순으로 정렬한다', () => {
    expect(
      [lowPriorityNote, highPriorityNote]
        .sort((left, right) =>
          compareNotes(left, right, 'updated-desc'),
        )
        .map((note) => note.id),
    ).toEqual(['high', 'low']);

    expect(
      [lowPriorityNote, highPriorityNote]
        .sort((left, right) =>
          compareNotes(left, right, 'created-desc'),
        )
        .map((note) => note.id),
    ).toEqual(['high', 'low']);
  });

  it('우선순위를 양방향으로 정렬한다', () => {
    expect(
      [lowPriorityNote, highPriorityNote]
        .sort((left, right) =>
          compareNotes(left, right, 'priority-desc'),
        )
        .map((note) => note.id),
    ).toEqual(['high', 'low']);

    expect(
      [lowPriorityNote, highPriorityNote]
        .sort((left, right) =>
          compareNotes(left, right, 'priority-asc'),
        )
        .map((note) => note.id),
    ).toEqual(['low', 'high']);
  });
});
