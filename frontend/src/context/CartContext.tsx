import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as cartApi from '../api/cart';
import { getApiErrorMessage } from '../api/errors';
import { useAuth } from './AuthContext';
import type { Cart } from '../types';

interface CartContextValue {
  cart: Cart | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  itemCount: number;
  addItem: (productId: number, quantity?: number) => Promise<Cart>;
  updateItem: (itemId: number, quantity: number) => Promise<Cart>;
  removeItem: (itemId: number) => Promise<Cart>;
  refreshCart: () => Promise<void>;
  resetCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!user) {
      setCart(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    cartApi
      .getCart()
      .then((nextCart) => {
        if (active) setCart(nextCart);
      })
      .catch((err: unknown) => {
        if (active) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const addItem = useCallback(async (productId: number, quantity = 1) => {
    const nextCart = await cartApi.addCartItem(productId, quantity);
    setCart(nextCart);
    setError(null);
    return nextCart;
  }, []);

  const updateItem = useCallback(async (itemId: number, quantity: number) => {
    const nextCart = await cartApi.updateCartItem(itemId, quantity);
    setCart(nextCart);
    setError(null);
    return nextCart;
  }, []);

  const removeItem = useCallback(async (itemId: number) => {
    const nextCart = await cartApi.removeCartItem(itemId);
    setCart(nextCart);
    setError(null);
    return nextCart;
  }, []);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setIsRefreshing(true);
    try {
      const nextCart = await cartApi.getCart();
      setCart(nextCart);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
      throw err;
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  const resetCart = useCallback(() => {
    setCart(null);
    setError(null);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isLoading,
      isRefreshing,
      error,
      itemCount: cart?.itemCount ?? 0,
      addItem,
      updateItem,
      removeItem,
      refreshCart,
      resetCart,
    }),
    [
      cart,
      isLoading,
      isRefreshing,
      error,
      addItem,
      updateItem,
      removeItem,
      refreshCart,
      resetCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}
