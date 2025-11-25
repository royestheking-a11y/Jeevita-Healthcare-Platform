import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  }, [user]);

  // Save cart to API whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      if (user && user.id && cart.length >= 0) {
        try {
          await cartsAPI.update(user.id, cart);
        } catch (e) {
          console.error('Error saving cart to API:', e);
        }
      }
    };
    saveCart();
  }, [cart, user]);

  const refreshCart = async () => {
    if (user && user.id) {
      try {
        const cartData = await cartsAPI.getByUserId(user.id);
        setCart(cartData.items || []);
      } catch (e) {
        console.error('Error refreshing cart:', e);
        setCart([]);
      }
    }
  };

  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = async (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(i => (i.id === id ? { ...i, quantity } : i)));
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
