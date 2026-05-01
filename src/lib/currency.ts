/** Format number to $1.000.000 */
export function formatCLP(amount: number | string): string {
  const num = Math.abs(parseInt(String(amount)) || 0);
  const str = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$${str}`;
}

/** Signed: +$70.000 / -$30.000 */
export function formatCLPSigned(amount: number | string): string {
  const num = parseInt(String(amount)) || 0;
  const abs = Math.abs(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (num > 0) return `+$${abs}`;
  if (num < 0) return `-$${abs}`;
  return `$${abs}`;
}
