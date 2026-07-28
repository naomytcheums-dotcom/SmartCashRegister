// 1 point for every 100 FCFA spent (adjustable here).
const POINTS_PER_FCFA = 1 / 100;

export function computePointsEarned(total) {
  return Math.floor(total * POINTS_PER_FCFA);
}
