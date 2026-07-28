/**
 * Cart calculation logic, extracted from the React component so it's
 * testable independently of the UI (no React Native dependency).
 */

export function computeSubtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function computeDiscountAmount(subtotal, discount) {
  if (!discount || !discount.value) return 0;

  if (discount.type === 'percent') {
    const clampedPercent = Math.min(Math.max(discount.value, 0), 100);
    return subtotal * (clampedPercent / 100);
  }

  // discount.type === 'amount'
  return Math.min(Math.max(discount.value, 0), subtotal);
}

export function computeTotal(subtotal, discountAmount) {
  return Math.max(subtotal - discountAmount, 0);
}
