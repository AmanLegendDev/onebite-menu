"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function OrderSuccessPage() {
  const [order, setOrder] = useState(null);
  const [liveStatus, setLiveStatus] = useState("pending");

  useEffect(() => {
    const savedOrder = localStorage.getItem("latestOrder");
    if (savedOrder) {
      const parsed = JSON.parse(savedOrder);
      setOrder(parsed);
      setLiveStatus(parsed.status || "pending");
    }
  }, []);

  // 🔔 Play sound on page load
  useEffect(() => {
    const audio = new Audio("/notify.mp3");
    audio.volume = 1;
    audio.play().catch(() => {});
  }, []);

  // 🔥 LIVE STATUS SYNC
  useEffect(() => {
    if (!order?._id) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/orders/${order._id}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (data?.order?.status) {
        setLiveStatus(data.order.status);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [order]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-white bg-[#0d0d0d]">
        Loading your order...
      </div>
    );
  }

  // STATUS TEXT
  const statusText = {
    pending: "Your order is waiting to be accepted…",
    preparing: "Your order is now being prepared 🔥",
    ready: "Your order is ready to be served! 😍",
    served: "Enjoy your meal! 🍽️",
  };

  const statusColor = {
    pending: "text-yellow-300",
    preparing: "text-orange-400",
    ready: "text-green-400",
    served: "text-blue-400",
  };

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

      {/* STATUS */}
      <div className="text-center mt-6">
        <h1 className="text-3xl font-extrabold tracking-wide text-yellow-400">
          Order Confirmed 🎉
        </h1>

        <p className={`mt-2 text-sm font-semibold ${statusColor[liveStatus]}`}>
          {statusText[liveStatus]}
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

        {/* ITEMS LIST */}
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

        {/* BILL BREAKDOWN */}
        <div className="border-t border-gray-700 my-5"></div>

        <div className="space-y-2 text-[15px]">
          {/* SUBTOTAL */}
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal</span>
            <span className="font-semibold">₹{order.totalPrice}</span>
          </div>

          {/* DISCOUNT */}
          {order.discount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>
                Discount{" "}
                {order.couponCode ? `(${order.couponCode})` : ""}
              </span>
              <span>-₹{order.discount}</span>
            </div>
          )}

          {/* FINAL TOTAL */}
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total Payable</span>
            <span className="text-yellow-400">₹{order.finalPrice}</span>
          </div>
        </div>

        {/* TABLE */}
        <div className="mt-6 bg-yellow-400 text-black p-3 rounded-lg text-center font-extrabold text-lg shadow-md">
          Table: {order.table || "—"}
        </div>

        {/* VIEW BILL BUTTON */}
        <button
          onClick={() => (window.location.href = `/bill/${order._id}`)}
          className="mt-6 w-full bg-[#FF6A3D] hover:bg-[#ff7c50] text-white py-3 rounded-lg font-bold text-sm shadow-lg active:scale-95 transition"
        >
          View Detailed Bill →
        </button>

        {/* DATE */}
        <p className="text-center text-gray-500 text-xs mt-4">
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </motion.div>

      {/* FOOTER */}
      <div className="mt-12 text-center opacity-70">
        <p className="text-xs">Made with ❤️ by Aman</p>
        <p className="text-[10px] text-gray-500">© OneBite Menu System</p>
      </div>

      {/* BACK BUTTON */}
      <div className="mt-8 text-center">
        <button
          onClick={() => {
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