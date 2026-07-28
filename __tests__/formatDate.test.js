import { formatDateTime } from '../src/utils/formatDate';

describe('formatDateTime', () => {
  it('formats a date in a readable, locale-independent way', () => {
    const date = new Date(2026, 0, 15, 9, 5); // 15 janvier 2026, 09:05
    expect(formatDateTime(date)).toBe('15 janv. 2026 — 09:05');
  });

  it('pads single-digit hours and minutes with a leading zero', () => {
    const date = new Date(2026, 5, 3, 8, 3); // 3 juin 2026, 08:03
    expect(formatDateTime(date)).toBe('3 juin 2026 — 08:03');
  });
});
