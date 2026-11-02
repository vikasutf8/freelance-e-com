import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { CartItem as CartItemType } from '../types';
import { CartItem } from './CartItem';

const item: CartItemType = {
  id: 10,
  productId: 1,
  quantity: 2,
  priceAtAdd: 499,
  subtotal: 998,
  product: {
    id: 1,
    name: 'Calming Green Tea Face Wash',
    price: 499,
    description: null,
    imageUrl: null,
    stock: 5,
  },
};

describe('CartItem', () => {
  it('renders the line item and calls quantity and remove handlers', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const onRemove = vi.fn();

    render(
      <MemoryRouter>
        <CartItem item={item} onUpdate={onUpdate} onRemove={onRemove} />
      </MemoryRouter>,
    );

    expect(screen.getByText('₹499 each')).toBeInTheDocument();
    expect(screen.getByText('₹998')).toBeInTheDocument();
    expect(screen.getByText('Only 5 left')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /increase quantity of calming green tea face wash/i,
      }),
    );
    expect(onUpdate).toHaveBeenCalledWith(3);

    await user.click(
      screen.getByRole('button', {
        name: /remove calming green tea face wash from cart/i,
      }),
    );
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('prevents increasing beyond available stock', () => {
    render(
      <MemoryRouter>
        <CartItem
          item={{ ...item, quantity: 5 }}
          onUpdate={vi.fn()}
          onRemove={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', {
        name: /increase quantity of calming green tea face wash/i,
      }),
    ).toBeDisabled();
  });
});
