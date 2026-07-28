/**
 * Computes the margin (profit) and margin rate for a product.
 * Pure function, testable independently of the UI/DB.
 */
export function computeMargin(price, costPrice) {
  const cost = costPrice || 0;
  const margin = price - cost;
  const marginPercent = price > 0 ? (margin / price) * 100 : 0;
  return { margin, marginPercent };
}
