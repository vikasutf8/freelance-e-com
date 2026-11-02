import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PaginatedOrders } from '../types';
import { Orders } from './Orders';

const mocks = vi.hoisted(() => ({
  listOrders: vi.fn(),
}));

vi.mock('../api/orders', () => ({
  listOrders: mocks.listOrders,
}));

const history: PaginatedOrders = {
  data: [
    {
      id: 18,
      userId: 4,
      customerEmail: 'member@example.com',
      paymentId: 7,
      total: 1298,
      status: 'paid',
      itemCount: 2,
      createdAt: '2026-11-01T10:30:00.000Z',
      items: [
        {
          id: 22,
          productId: 3,
          productName: 'Calming Green Tea Face Wash',
          unitPrice: 649,
          quantity: 2,
          subtotal: 1298,
        },
      ],
    },
  ],
  meta: { total: 1, page: 1, limit: 6, totalPages: 1 },
};

describe('Orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the customer order history with saved item details', async () => {
    mocks.listOrders.mockResolvedValue(history);

    render(
      <MemoryRouter>
        <Orders />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: /order history/i }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Order #PL-000018')).toBeInTheDocument();
    });
    expect(
      screen.getByText('Calming Green Tea Face Wash'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('₹1,298').length).toBeGreaterThan(0);
    expect(screen.getByText('member@example.com')).toBeInTheDocument();
  });

  it('shows an inviting empty state when there are no orders', async () => {
    mocks.listOrders.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 6, totalPages: 0 },
    });

    render(
      <MemoryRouter>
        <Orders />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/your order history is still unwritten/i),
      ).toBeInTheDocument();
    });
  });
});
