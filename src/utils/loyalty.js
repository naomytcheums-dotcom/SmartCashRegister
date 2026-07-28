// 1 point tous les 100 FCFA dépensés (ajustable ici).
const POINTS_PER_FCFA = 1 / 100;

export function computePointsEarned(total) {
  return Math.floor(total * POINTS_PER_FCFA);
}
