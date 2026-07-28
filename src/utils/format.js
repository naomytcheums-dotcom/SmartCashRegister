/**
 * Formatte un montant en FCFA de façon fiable, sans dépendre de
 * toLocaleString() (dont le comportement peut varier selon le moteur JS
 * du téléphone — Hermes n'a pas toujours le support Intl complet, ce qui
 * peut donner un formatage inattendu). Ici on fait le séparateur de
 * milliers nous-mêmes, donc le résultat est toujours prévisible.
 */
export function formatFCFA(amount) {
  const rounded = Math.round(amount || 0);
  const withSpaces = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${withSpaces} FCFA`;
}

export function formatNumber(amount) {
  const rounded = Math.round(amount || 0);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
