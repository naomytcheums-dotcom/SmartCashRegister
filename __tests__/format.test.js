import { formatFCFA, formatNumber } from '../src/utils/format';

describe('formatFCFA', () => {
  it('formats a whole number with thousand separators and the FCFA suffix', () => {
    expect(formatFCFA(2500)).toBe('2 500 FCFA');
  });

  it('formats large numbers correctly', () => {
    expect(formatFCFA(1234567)).toBe('1 234 567 FCFA');
  });

  it('formats zero', () => {
    expect(formatFCFA(0)).toBe('0 FCFA');
  });

  it('rounds decimal amounts', () => {
    expect(formatFCFA(2499.6)).toBe('2 500 FCFA');
  });

  it('handles undefined/null gracefully', () => {
    expect(formatFCFA(undefined)).toBe('0 FCFA');
    expect(formatFCFA(null)).toBe('0 FCFA');
  });
});

describe('formatNumber', () => {
  it('formats without the FCFA suffix', () => {
    expect(formatNumber(15000)).toBe('15 000');
  });
});
