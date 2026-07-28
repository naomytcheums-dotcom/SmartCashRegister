/**
 * Reliably formats an amount in FCFA, without relying on
 * toLocaleString() (whose behavior can vary depending on the phone's
 * JS engine — Hermes doesn't always have full Intl support, which can
 * produce unexpected formatting). The thousands separator is handled
 * manually here, so the result is always predictable.
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
