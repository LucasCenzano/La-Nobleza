'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  productoId: string;
  nombre: string;
  precioFinal: number;
  tipoVenta: 'UNIDAD' | 'PESO';
  cantidad: number;
  imagenUrl: string | null;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (productoId: string, cantidad: number) => void;
  removeItem: (productoId: string) => void;
  totalItems: number;
  totalPrice: number;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Solo cargar/guardar localStorage cuando estemos en el cliente
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('lanobleza_cart');
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('lanobleza_cart', JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(i => i.productoId === newItem.productoId);
      if (existing) {
        return prev.map(i => 
          i.productoId === newItem.productoId 
            ? { ...i, cantidad: i.cantidad + newItem.cantidad } 
            : i
        );
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(productoId);
      return;
    }
    setItems(prev => prev.map(i => i.productoId === productoId ? { ...i, cantidad } : i));
  };

  const removeItem = (productoId: string) => {
    setItems(prev => prev.filter(i => i.productoId !== productoId));
  };

  const clearCart = () => setItems([]);

  // Calculamos todo
  const totalItems = items.reduce((acc, i) => acc + (i.tipoVenta === 'UNIDAD' ? Math.ceil(i.cantidad) : 1), 0);
  const totalPrice = items.reduce((acc, i) => acc + (i.precioFinal * i.cantidad), 0);

  return (
    <CartContext.Provider value={{ 
      items, addItem, updateQuantity, removeItem, clearCart, 
      totalItems, totalPrice, isCartOpen, setIsCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart error');
  return context;
}
