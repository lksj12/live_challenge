import { describe, expect, it } from 'vitest';

import themeReducer, { toggleTheme } from './themeSlice';

describe('themeSlice', () => {
  it('라이트와 다크 모드를 전환한다', () => {
    const darkState = themeReducer({ mode: 'light' }, toggleTheme());
    const lightState = themeReducer(darkState, toggleTheme());

    expect(darkState.mode).toBe('dark');
    expect(lightState.mode).toBe('light');
  });
});
