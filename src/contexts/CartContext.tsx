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

  // Load cart from API on mount and when user changes
  useEffect(() => {
    const loadCart = async () => {
      if (user && user.id) {
        try {
          const cartData = await cartsAPI.getByUserId(user.id);
          setCart(cartData.items || []);
        } catch (e) {
          console.error('Error loading cart from API:', e);
          setCart([]);
        }
      } else {
        setCart([]);
      }
    };
    loadCart();

    // Refresh cart on window focus
    const handleFocus = () => {
      loadCart();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);



  const refreshCart = useCallback(async () => {
    if (user && user.id) {
      try {
        // console.log('Polling cart for user:', user.id);
        const cartData = await cartsAPI.getByUserId(user.id);
        // console.log('Poll result:', cartData);
        setCart(cartData.items || []);
      } catch (e) {
        console.error('Error refreshing cart:', e);
        // Don't clear cart on error to prevent flickering if API fails briefly
      }
    }
  }, [user]);

  // Poll for cart updates every 3 seconds
  useEffect(() => {
    if (!user || !user.id) return;

    const interval = setInterval(() => {
      refreshCart();
    }, 3000);

    return () => clearInterval(interval);
  }, [user, refreshCart]);

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    const newItem = { ...item, quantity: 1 };
    let newCart: CartItem[] = [];

    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        newCart = prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newCart = [...prev, newItem];
      }
      return newCart;
    });

    if (user && user.id) {
      try {
        // We need to wait for state update or use the calculated newCart
        await cartsAPI.update(user.id, newCart);
      } catch (e) {
        console.error('Error adding to cart:', e);
      }
    }
  };

  const removeFromCart = async (id: string) => {
    let newCart: CartItem[] = [];
    setCart(prev => {
      newCart = prev.filter(i => i.id !== id);
      return newCart;
    });

    if (user && user.id) {
      try {
        await cartsAPI.update(user.id, newCart);
      } catch (e) {
        console.error('Error removing from cart:', e);
      }
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    let newCart: CartItem[] = [];
    setCart(prev => {
      newCart = prev.map(i => (i.id === id ? { ...i, quantity } : i));
      return newCart;
    });

    if (user && user.id) {
      try {
        await cartsAPI.update(user.id, newCart);
      } catch (e) {
        console.error('Error updating quantity:', e);
      }
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
        refreshCart,
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
