import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';

const mocks = vi.hoisted(() => ({
  addItem: vi.fn(),
  addToast: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 2,
      email: 'client@example.com',
      role: 'client',
      createdAt: '2026-01-15T10:31:00.000Z',
    },
  }),
}));

vi.mock('../context/CartContext', () => ({
  useCart: () => ({ addItem: mocks.addItem }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: mocks.addToast }),
}));

const product: Product = {
  id: 7,
  name: 'Calming Green Tea Face Wash',
  price: 499,
  description: 'A gentle daily cleanser.',
  imageUrl: null,
  stock: 12,
  createdBy: 1,
};

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.addItem.mockResolvedValue({
      id: 1,
      items: [],
      total: 499,
      itemCount: 1,
    });
  });

  it('renders product details and adds the item to the cart', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: /^view calming green tea face wash$/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('₹499')).toBeInTheDocument();
    expect(screen.getByText('Cleansers')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    await waitFor(() => {
      expect(mocks.addItem).toHaveBeenCalledWith(7, 1);
    });
    expect(mocks.addToast).toHaveBeenCalledWith(
      expect.objectContaining({ tone: 'success', title: 'Added to your bag' }),
    );
  });

  it('disables adding a sold-out product', () => {
    render(
      <MemoryRouter>
        <ProductCard product={{ ...product, stock: 0 }} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /sold out/i })).toBeDisabled();
    expect(screen.getAllByText('Sold out').length).toBeGreaterThan(0);
  });
});
