const MONTHS = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

/**
 * Formatage de date manuel, pour la même raison que formatFCFA() :
 * ne pas dépendre de toLocaleString() dont le comportement peut varier
 * selon le moteur JS (Hermes) du téléphone.
 */
export function formatDateTime(date) {
  const d = new Date(date);
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} — ${hours}:${minutes}`;
}
