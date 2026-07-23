import { describe, expect, it } from 'vitest';

import tagsReducer, {
  createMemberTag,
  fetchMemberTags,
} from './tagsSlice';
import type { Tag } from '../types/note';

const tag: Tag = {
  id: 'tag-1',
  name: '업무',
  createdAt: '2026-07-23T00:00:00.000Z',
};

describe('tagsSlice', () => {
  it('회원 태그 목록을 불러온다', () => {
    const state = tagsReducer(
      undefined,
      fetchMemberTags.fulfilled([tag], 'request-1', undefined),
    );

    expect(state.items).toEqual([tag]);
    expect(state.loadState).toBe('succeeded');
  });

  it('새 태그를 이름순으로 추가한다', () => {
    const firstState = tagsReducer(
      undefined,
      createMemberTag.fulfilled(
        { ...tag, id: 'tag-2', name: 'Zulu' },
        'request-2',
        'Zulu',
      ),
    );
    const state = tagsReducer(
      firstState,
      createMemberTag.fulfilled(
        { ...tag, name: 'Alpha' },
        'request-3',
        'Alpha',
      ),
    );

    expect(state.items.map((item) => item.name)).toEqual(['Alpha', 'Zulu']);
    expect(state.mutationState).toBe('idle');
  });
});
