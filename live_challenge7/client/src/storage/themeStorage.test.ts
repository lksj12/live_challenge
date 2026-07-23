import { describe, expect, it } from 'vitest';

import { parseTheme } from './themeStorage';

describe('themeStorage', () => {
  it('지원하는 테마 값만 복원한다', () => {
    expect(parseTheme('light')).toBe('light');
    expect(parseTheme('dark')).toBe('dark');
    expect(parseTheme('system')).toBeNull();
    expect(parseTheme(null)).toBeNull();
  });
});
