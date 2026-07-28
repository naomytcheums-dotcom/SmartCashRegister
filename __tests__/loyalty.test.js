import { computePointsEarned } from '../src/utils/loyalty';

describe('computePointsEarned', () => {
  it('awards 1 point per 100 FCFA spent', () => {
    expect(computePointsEarned(1000)).toBe(10);
  });

  it('rounds down (floors) partial points', () => {
    expect(computePointsEarned(1050)).toBe(10);
    expect(computePointsEarned(199)).toBe(1);
  });

  it('returns 0 for amounts under 100 FCFA', () => {
    expect(computePointsEarned(50)).toBe(0);
  });

  it('returns 0 for a total of 0', () => {
    expect(computePointsEarned(0)).toBe(0);
  });
});
