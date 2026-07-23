import { describe, expect, it } from 'vitest';

import { normalizeHexColor } from './color';

describe('normalizeHexColor', () => {
  it('3자리와 6자리 HEX 코드를 서버 형식으로 정규화한다', () => {
    expect(normalizeHexColor('#3af')).toBe('#33AAFF');
    expect(normalizeHexColor('f7d774')).toBe('#F7D774');
  });

  it('유효하지 않은 색상 코드를 거절한다', () => {
    expect(normalizeHexColor('#12')).toBeNull();
    expect(normalizeHexColor('#GGGGGG')).toBeNull();
    expect(normalizeHexColor('red')).toBeNull();
  });
});
