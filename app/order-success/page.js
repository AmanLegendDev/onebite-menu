"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

export default function OrderSuccessPage() {
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem("latestOrder");
    if (savedOrder) setOrder(JSON.parse(savedOrder));
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-white bg-[#0d0d0d]">
        Loading your order...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] px-6 py-10 text-white">

      {/* LOGO */}
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.7, type: "spring" }}
        className="flex justify-center"
      >
        <img
          src="/onebite-2.jpg"
          className="w-32 h-32 object-cover rounded-full shadow-[0_0_25px_rgba(255,177,0,0.5)] border-2 border-[#FFB100]"
        />
      </motion.div>

      {/* SUCCESS BADGE */}
      <div className="text-center mt-6">
        

        <h1 className="text-4xl font-extrabold mt-6 tracking-wide text-yellow-400">
          Order Confirmed!
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          We’re preparing your order… sit back & relax 😋🔥
        </p>
      </div>

      {/* SUMMARY CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#111] rounded-2xl shadow-xl p-6 mt-10 border border-[#222]"
      >
        <h2 className="text-xl font-bold mb-5 text-yellow-400">
          Order Summary
        </h2>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-xl border border-[#333] shadow-md"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-400">
                  {item.qty} × ₹{item.price}
                </p>
              </div>

              <p className="font-extrabold text-[#FF6A3D]">
                ₹{item.qty * item.price}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-700 my-5"></div>

        {/* TOTAL */}
        <div className="flex justify-between text-lg font-bold">
          <p>Total Bill</p>
          <p className="text-yellow-400">₹{order.totalPrice}</p>
        </div>

        {/* TABLE */}
        <div className="mt-6 bg-yellow-400 text-black p-3 rounded-lg text-center font-extrabold text-lg shadow-md">
          Table: {order.table}
        </div>

        {/* TIME */}
        <p className="text-center text-gray-400 text-xs mt-4">
          {new Date(order.createdAt).toLocaleString()}
        </p>

        {/* VIEW BILL BUTTON */}
        <button
          onClick={() => (window.location.href = `/bill/${order._id}`)}
          className="mt-6 w-full bg-[#FF6A3D] hover:bg-[#ff7c50] text-white py-3 rounded-lg font-bold text-sm shadow-lg active:scale-95 transition"
        >
          View Detailed Bill →
        </button>
      </motion.div>

      {/* BACK TO MENU */}
      <div className="mt-12 text-center">
        <button
          onClick={() => {
            clearCart();
            window.location.href = "/menu";
          }}
          className="bg-yellow-400 hover:bg-yellow-300 px-10 py-3 rounded-full text-lg font-bold text-black shadow-[0_0_20px_rgba(255,177,0,0.4)] active:scale-95 transition"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}
