"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // 🔥 LOAD FROM LOCAL STORAGE (ONCE)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cart_data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setCart(parsed);
          }
        } catch (error) {
          console.log("Cart parse failed:", error);
        }
      }
    }
  }, []);

  // 🔥 SAVE TO LOCAL STORAGE (EVERY CHANGE)
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart_data", JSON.stringify(cart));
    }
  }, [cart]);

  // ---------------------------
  // METHODS
  // ---------------------------

  function addToCart(item) {
    setCart((prev) => {
      const existingItem = prev.find((p) => p._id === item._id);

      if (existingItem) {
        return prev.map((p) =>
          p._id === item._id ? { ...p, qty: p.qty + 1 } : p
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart((prev) => prev.filter((item) => item._id !== id));
  }

  function increaseQty(id) {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  }

  function decreaseQty(id) {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === id && item.qty > 0
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter((i) => i.qty > 0)
    );
  }

function clearCart() {
  setCart([]);

  if (typeof window !== "undefined") {
    localStorage.removeItem("cart_data");   // your main key
    localStorage.removeItem("cartItems");   // 🔥 second key phone/Vercel uses
  }
}


  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
