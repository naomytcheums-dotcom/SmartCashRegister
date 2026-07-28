/**
 * Calcule la marge (bénéfice) et le taux de marge d'un produit.
 * Fonction pure, testable indépendamment de l'UI/DB.
 */
export function computeMargin(price, costPrice) {
  const cost = costPrice || 0;
  const margin = price - cost;
  const marginPercent = price > 0 ? (margin / price) * 100 : 0;
  return { margin, marginPercent };
}
