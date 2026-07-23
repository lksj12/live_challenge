export function normalizeHexColor(value: string): string | null {
  const normalized = value.trim().replace(/^#/, '').toUpperCase();

  if (/^[0-9A-F]{3}$/.test(normalized)) {
    return `#${normalized
      .split('')
      .map((character) => character.repeat(2))
      .join('')}`;
  }
  if (/^[0-9A-F]{6}$/.test(normalized)) {
    return `#${normalized}`;
  }
  return null;
}
