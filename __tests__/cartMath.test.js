import { computeSubtotal, computeDiscountAmount, computeTotal } from '../src/utils/cartMath';

describe('computeSubtotal', () => {
  it('sums price × quantity across items', () => {
    const items = [
      { price: 500, quantity: 2 },
      { price: 2500, quantity: 1 },
    ];
    expect(computeSubtotal(items)).toBe(3500);
  });

  it('returns 0 for an empty cart', () => {
    expect(computeSubtotal([])).toBe(0);
  });
});

describe('computeDiscountAmount', () => {
  it('applies a percentage discount', () => {
    expect(computeDiscountAmount(1000, { type: 'percent', value: 10 })).toBe(100);
  });

  it('applies a fixed amount discount', () => {
    expect(computeDiscountAmount(1000, { type: 'amount', value: 300 })).toBe(300);
  });

  it('clamps a percentage above 100 to 100%', () => {
    expect(computeDiscountAmount(1000, { type: 'percent', value: 150 })).toBe(1000);
  });

  it('clamps a fixed discount to never exceed the subtotal', () => {
    expect(computeDiscountAmount(1000, { type: 'amount', value: 5000 })).toBe(1000);
  });

  it('ignores negative discount values', () => {
    expect(computeDiscountAmount(1000, { type: 'percent', value: -20 })).toBe(0);
  });

  it('returns 0 when there is no discount', () => {
    expect(computeDiscountAmount(1000, { type: 'percent', value: 0 })).toBe(0);
  });
});

describe('computeTotal', () => {
  it('subtracts the discount from the subtotal', () => {
    expect(computeTotal(1000, 200)).toBe(800);
  });

  it('never goes below 0', () => {
    expect(computeTotal(500, 900)).toBe(0);
  });
});
