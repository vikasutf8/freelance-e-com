import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Login } from './Login';

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  addToast: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    login: mocks.login,
  }),
}));

vi.mock('../context/ToastContext', () => ({
  useToast: () => ({ addToast: mocks.addToast }),
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<div>Storefront home</div>} />
        <Route path="/admin/products" element={<div>Admin products</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.login.mockResolvedValue({
      id: 2,
      email: 'client@example.com',
      role: 'client',
      createdAt: '2026-01-15T10:31:00.000Z',
    });
  });

  it('shows a validation error for an invalid email', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/email address/i), 'not-an-email');
    await user.type(screen.getByLabelText(/^password$/i), 'StrongPass123!');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it('signs in and returns to the storefront', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(
      screen.getByLabelText(/email address/i),
      'client@example.com',
    );
    await user.type(screen.getByLabelText(/^password$/i), 'StrongPass123!');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(mocks.login).toHaveBeenCalledWith(
        'client@example.com',
        'StrongPass123!',
      );
    });
    expect(await screen.findByText('Storefront home')).toBeInTheDocument();
    expect(mocks.addToast).toHaveBeenCalledWith(
      expect.objectContaining({ tone: 'success' }),
    );
  });
});
