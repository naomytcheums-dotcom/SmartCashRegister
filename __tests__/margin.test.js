import { computeMargin } from '../src/utils/margin';

describe('computeMargin', () => {
  it('computes the margin in FCFA and as a percentage', () => {
    const { margin, marginPercent } = computeMargin(2500, 1800);
    expect(margin).toBe(700);
    expect(marginPercent).toBeCloseTo(28, 1);
  });

  it('treats a missing cost price as 0 (100% margin)', () => {
    const { margin, marginPercent } = computeMargin(1000, undefined);
    expect(margin).toBe(1000);
    expect(marginPercent).toBe(100);
  });

  it('handles a price of 0 without dividing by zero', () => {
    const { margin, marginPercent } = computeMargin(0, 0);
    expect(margin).toBe(0);
    expect(marginPercent).toBe(0);
  });

  it('can return a negative margin when selling at a loss', () => {
    const { margin } = computeMargin(500, 800);
    expect(margin).toBe(-300);
  });
});
