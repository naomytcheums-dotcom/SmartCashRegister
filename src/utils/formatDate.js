const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Manual date formatting, for the same reason as formatFCFA():
 * don't rely on toLocaleString(), whose behavior can vary depending on
 * the phone's JS engine (Hermes).
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
