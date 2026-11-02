export interface UpiLinkOptions {
  payeeName?: string;
  note?: string;
}

export function buildUpiLink(
  upiId: string,
  amount: number,
  options: UpiLinkOptions = {},
): string {
  const params = new URLSearchParams({
    pa: upiId,
    am: amount.toFixed(2),
    cu: 'INR',
  });

  if (options.payeeName?.trim()) {
    params.set('pn', options.payeeName.trim());
  }

  if (options.note?.trim()) {
    params.set('tn', options.note.trim());
  }

  return `upi://pay?${params.toString().replace(/%40/g, '@')}`;
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
