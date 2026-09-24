const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

/** "10 Aug 26" */
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]!} ${String(d.getFullYear()).slice(2)}`;
}

/** "11:50 PM" */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  let hours = d.getHours();
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} ${meridiem}`;
}

/** "1st Winner" style ordinal (1 → 1st, 2 → 2nd, 3 → 3rd, 4 → 4th…) */
export function ordinal(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

/** ₹ 1,500 */
export function formatRupees(amount: number): string {
  return `₹ ${amount.toLocaleString('en-IN')}`;
}
