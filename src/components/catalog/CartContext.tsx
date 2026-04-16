'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  productoId: string;
  nombre: string;
  precioFinal: number;
  tipoVenta: 'UNIDAD' | 'PESO';
  cantidad: number;
  imagenUrl: string | null;
  incrementoPeso?: number | null;
  stock?: number | null;
  instrucciones?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (productoId: string, instrucciones: string | undefined, cantidad: number) => void;
  removeItem: (productoId: string, instrucciones: string | undefined) => void;
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
      // Find item with same ID AND same instrucciones
      const existing = prev.find(i => i.productoId === newItem.productoId && i.instrucciones === newItem.instrucciones);
      if (existing) {
        return prev.map(i => 
          (i.productoId === newItem.productoId && i.instrucciones === newItem.instrucciones)
            ? { ...i, cantidad: i.cantidad + newItem.cantidad } 
            : i
        );
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (productoId: string, instrucciones: string | undefined, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(productoId, instrucciones);
      return;
    }
    setItems(prev => prev.map(i => (i.productoId === productoId && i.instrucciones === instrucciones) ? { ...i, cantidad } : i));
  };

  const removeItem = (productoId: string, instrucciones: string | undefined) => {
    setItems(prev => prev.filter(i => !(i.productoId === productoId && i.instrucciones === instrucciones)));
  };

  const clearCart = () => setItems([]);

  // Calculamos todo
  const totalItems = items.reduce((acc, i) => acc + (i.tipoVenta === 'UNIDAD' ? Math.ceil(i.cantidad) : 1), 0);
  const totalPrice = Math.round(items.reduce((acc, i) => acc + (Math.round(i.precioFinal) * i.cantidad), 0));

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
