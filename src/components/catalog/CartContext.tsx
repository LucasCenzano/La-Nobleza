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
  promoCantidadRequerida?: number | null;
  promoPrecioTotal?: number | null;
}

export function calculateItemTotal(item: CartItem): number {
  const basePrice = Math.round(item.precioFinal);
  if (item.promoCantidadRequerida && item.promoPrecioTotal && item.cantidad >= item.promoCantidadRequerida) {
    // Si la cantidad es mayor al requerimiento, armamos los "combos"
    // e.g. si lleva 2.5kg y la promo es cada 2kg, hay 1 combo + 0.5kg normales.
    // OJO: calculamos el EPSILON de javascript evitando errores de precision.
    const qty = Math.round(item.cantidad * 1000) / 1000;
    const req = item.promoCantidadRequerida;
    const combos = Math.floor(qty / req);
    const resto = (qty - (combos * req));
    // Redondeamos para evitar decimales sueltos
    return Math.round((combos * item.promoPrecioTotal) + (resto * basePrice));
  }
  return Math.round(basePrice * item.cantidad);
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
  allProducts: any[];
  setAllProducts: (products: any[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
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
    // ── Validación: UNIDAD siempre entero ──
    if (newItem.tipoVenta === 'UNIDAD') {
      newItem = { ...newItem, cantidad: Math.max(1, Math.round(newItem.cantidad)) };
    }

    setItems((prev) => {
      // Find item with same ID AND same instrucciones
      const existing = prev.find(i => i.productoId === newItem.productoId && i.instrucciones === newItem.instrucciones);
      if (existing) {
        return prev.map(i => {
          if (i.productoId === newItem.productoId && i.instrucciones === newItem.instrucciones) {
            let nextCantidad = i.cantidad + newItem.cantidad;
            // Enforce integer for UNIDAD
            if (newItem.tipoVenta === 'UNIDAD') nextCantidad = Math.round(nextCantidad);
            // Cap at stock if it exists
            if (newItem.stock !== null && newItem.stock !== undefined) {
              nextCantidad = Math.min(nextCantidad, newItem.stock);
            }
            
            return {
              ...i,
              cantidad: nextCantidad,
              // Siempre actualizar los datos de promo del producto por si cambiaron
              precioFinal: newItem.precioFinal,
              promoCantidadRequerida: newItem.promoCantidadRequerida,
              promoPrecioTotal: newItem.promoPrecioTotal,
              incrementoPeso: newItem.incrementoPeso,
              stock: newItem.stock,
            };
          }
          return i;
        });
      }
      
      // For new item, also cap at stock just in case
      let finalItem = { ...newItem };
      if (newItem.stock !== null && newItem.stock !== undefined) {
        finalItem.cantidad = Math.min(newItem.cantidad, newItem.stock);
      }
      return [...prev, finalItem];
    });
  };

  const updateQuantity = (productoId: string, instrucciones: string | undefined, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(productoId, instrucciones);
      return;
    }
    setItems(prev => prev.map(i => {
      if (i.productoId === productoId && i.instrucciones === instrucciones) {
        let nextCantidad = cantidad;
        // Enforce integer for UNIDAD
        if (i.tipoVenta === 'UNIDAD') nextCantidad = Math.max(1, Math.round(nextCantidad));
        if (i.stock !== null && i.stock !== undefined) {
          nextCantidad = Math.min(nextCantidad, i.stock);
        }
        return { ...i, cantidad: nextCantidad };
      }
      return i;
    }));
  };

  const removeItem = (productoId: string, instrucciones: string | undefined) => {
    setItems(prev => prev.filter(i => !(i.productoId === productoId && i.instrucciones === instrucciones)));
  };

  const clearCart = () => setItems([]);

  // Calculamos todo
  const totalItems = items.reduce((acc, i) => acc + (i.tipoVenta === 'UNIDAD' ? Math.ceil(i.cantidad) : 1), 0);
  const totalPrice = items.reduce((acc, i) => acc + calculateItemTotal(i), 0);

  return (
    <CartContext.Provider value={{ 
      items, addItem, updateQuantity, removeItem, clearCart, 
      totalItems, totalPrice, isCartOpen, setIsCartOpen,
      allProducts, setAllProducts
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
