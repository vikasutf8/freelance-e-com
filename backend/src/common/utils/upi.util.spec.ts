import { buildUpiLink, roundCurrency } from './upi.util';

describe('upi.util', () => {
  it('builds a UPI deep link with a two-decimal amount', () => {
    expect(buildUpiLink('yourupi@bank', 2499.5)).toBe(
      'upi://pay?pa=yourupi@bank&am=2499.50&cu=INR',
    );
  });

  it('adds and encodes the payee name and note', () => {
    expect(
      buildUpiLink('shop@bank', 499, {
        payeeName: 'Purelis Skin',
        note: 'Order payment',
      }),
    ).toBe(
      'upi://pay?pa=shop@bank&am=499.00&cu=INR&pn=Purelis+Skin&tn=Order+payment',
    );
  });

  it('rounds currency to two decimals', () => {
    expect(roundCurrency(10.005)).toBe(10.01);
    expect(roundCurrency(99.994)).toBe(99.99);
  });
});
