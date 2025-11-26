import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { cartsAPI } from '../utils/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  const isUpdating = React.useRef(false);

  const fetchCart = useCallback(async (isPolling = false) => {
    if (!user || !user.id) {
      setCart([]);
      return;
    }

    // If we are in the middle of a local update, skip fetching to avoid overwriting
    // local changes with potentially stale server data.
    if (isUpdating.current) {
      // console.log('Skipping cart fetch due to local update lock');
      return;
    }

    try {
      const cartData = await cartsAPI.getByUserId(user.id);

      // Check lock again before setting state, in case an update started while we were fetching
      if (!isUpdating.current) {
        setCart(cartData.items || []);
      }
    } catch (e) {
      console.error('Error fetching cart:', e);
      // Only clear cart on error if it's not a polling request (to avoid flickering)
      if (!isPolling) {
        // Don't clear even on initial load error, maybe keep previous state?
        // But if it's initial load, previous state is empty.
        // Let's just log for now.
      }
    }
  }, [user]);

  // Initial load and window focus
  useEffect(() => {
    fetchCart(false);

    const handleFocus = () => {
      fetchCart(false);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchCart]);

  // Poll for cart updates
  useEffect(() => {
    if (!user || !user.id) return;

    const interval = setInterval(() => {
      fetchCart(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [user, fetchCart]);

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    isUpdating.current = true;
    const newItem = { ...item, quantity: 1 };

    // Calculate new state based on current cart
    let newCart: CartItem[];
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      newCart = cart.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      newCart = [...cart, newItem];
    }

    setCart(newCart);

    if (user && user.id) {
      try {
        await cartsAPI.update(user.id, newCart);
      } catch (e) {
        console.error('Error adding to cart:', e);
      } finally {
        // Add a delay before allowing polling again to ensure server consistency
        setTimeout(() => {
          isUpdating.current = false;
        }, 2000);
      }
    } else {
      isUpdating.current = false;
    }
  };

  const removeFromCart = async (id: string) => {
    isUpdating.current = true;

    const newCart = cart.filter(i => i.id !== id);
    setCart(newCart);

    if (user && user.id) {
      try {
        await cartsAPI.update(user.id, newCart);
      } catch (e) {
        console.error('Error removing from cart:', e);
      } finally {
        setTimeout(() => {
          isUpdating.current = false;
        }, 2000);
      }
    } else {
      isUpdating.current = false;
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    isUpdating.current = true;

    const newCart = cart.map(i => (i.id === id ? { ...i, quantity } : i));
    setCart(newCart);

    if (user && user.id) {
      try {
        await cartsAPI.update(user.id, newCart);
      } catch (e) {
        console.error('Error updating quantity:', e);
      } finally {
        setTimeout(() => {
          isUpdating.current = false;
        }, 2000);
      }
    } else {
      isUpdating.current = false;
    }
  };

  const clearCart = async () => {
    if (user && user.id) {
      try {
        await cartsAPI.clear(user.id);
      } catch (e) {
        console.error('Error clearing cart:', e);
      }
    }
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        refreshCart: () => fetchCart(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
