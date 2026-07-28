import React, { createContext, useContext, useState } from 'react';
import { computeSubtotal, computeDiscountAmount, computeTotal } from '../utils/cartMath';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // items: [{ id, barcode, name, price, stock, quantity, image, description, weight }]
  const [items, setItems] = useState([]);
  // Discount: { type: 'percent' | 'amount', value: number }
  const [discount, setDiscount] = useState({ type: 'percent', value: 0 });

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => {
    setItems([]);
    setDiscount({ type: 'percent', value: 0 });
  };

  const subtotal = computeSubtotal(items);
  const discountAmount = computeDiscountAmount(subtotal, discount);
  const total = computeTotal(subtotal, discountAmount);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        discount,
        setDiscount,
        discountAmount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
