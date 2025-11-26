"use client";

import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // ADD ITEM
  function addToCart(item) {
    setCart((prev) => {
      const exists = prev.find((p) => p._id === item._id);

      if (exists) {
        // increase quantity
        return prev.map((p) =>
          p._id === item._id ? { ...p, qty: p.qty + 1 } : p
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });
  }

  // REMOVE ITEM
  function removeFromCart(id) {
    setCart((prev) => prev.filter((item) => item._id !== id));
  }

  // INCREASE ITEM
  function increaseQty(id) {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  }

  // DECREASE ITEM
  function decreaseQty(id) {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === id && item.qty > 0
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, increaseQty, decreaseQty }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
