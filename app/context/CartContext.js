"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // ----------------------------------
  // 🔥 LOAD FROM LOCAL STORAGE (ONCE)
  // ----------------------------------
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

  // ----------------------------------
  // 🔥 SAVE TO LOCAL STORAGE (EVERY CHANGE)
  // ----------------------------------
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart_data", JSON.stringify(cart));
    }
  }, [cart]);

  // ----------------------------------
  // METHODS
  // ----------------------------------

  // ➕ Add to cart
  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find((p) => p._id === item._id);

      if (existing) {
        return prev.map((p) =>
          p._id === item._id ? { ...p, qty: p.qty + 1 } : p
        );
      }

      return [...prev, { ...item, qty: 1 }];
    });
  }

  // ❌ Remove entire item
  function removeFromCart(id) {
    setCart((prev) => prev.filter((item) => item._id !== id));
  }

  // 🔼 Increase qty
  function increaseQty(id) {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  }

  // 🔽 Decrease qty — FULLY FIXED
  function decreaseQty(id) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item._id === id) {
            const newQty = item.qty - 1;
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter((i) => i.qty > 0) // qty===0 → remove
    );
  }

  // 🧹 Clear entire cart
  function clearCart() {
    setCart([]);

    if (typeof window !== "undefined") {
      localStorage.removeItem("cart_data"); // correct key
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
