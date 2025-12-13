"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/formatDate";

export default function OrderSuccessPage() {
  const [order, setOrder] = useState(null);
  const [liveStatus, setLiveStatus] = useState("pending");

  // ⭐ Rating
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [popup, setPopup] = useState(false);

  // 🔥 CANCEL POPUP
  const [cancelled, setCancelled] = useState(false);

  // Load order
  useEffect(() => {
    const saved = localStorage.getItem("latestOrder");
    if (saved) {
      const parsed = JSON.parse(saved);
      setOrder(parsed);
      setLiveStatus(parsed.status || "pending");
    }
  }, []);

  // Clear cart completely
  useEffect(() => {
    sessionStorage.setItem("orderCompleted", "yes");
    localStorage.removeItem("cart");
    sessionStorage.removeItem("cart");
    sessionStorage.removeItem("selectedItems");
  }, []);

  // Notification sound
  useEffect(() => {
    const audio = new Audio("/notify.mp3");
    audio.volume = 1;
    audio.play().catch(() => {});
  }, []);

  // Show rating if not given before
  useEffect(() => {
    const rated = localStorage.getItem("onebite_rating_given");
    if (!rated) setShowRating(true);
  }, []);

  // Submit rating
  async function submitRating(star) {
    setRating(star);
    setPopup(true);

    await fetch("/api/rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stars: star,
        orderId: order?._id,
        customerName: order?.customerName || "",
        customerPhone: order?.customerPhone || "",
      }),
    });

    localStorage.setItem("onebite_rating_given", "yes");

    setTimeout(() => {
      setPopup(false);
      setShowRating(false);
    }, 1500);
  }

  // 🔥 LIVE STATUS POLLING (Handles CANCEL TOO)
  useEffect(() => {
    if (!order?._id) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/orders/${order._id}`, {
        cache: "no-store",
      });
      const data = await res.json();

      const status = data?.order?.status;

      if (!status) return;

      setLiveStatus(status);

      // 🔥 If order cancelled → show red popup
      if (status === "cancelled" || status === "rejected") {
        setCancelled(true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [order]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading your order...
      </div>
    );
  }

  const statusText = {
    pending: "Waiting for restaurant to accept…",
    preparing: "Your food is being prepared 🔥",
    ready: "Your order is ready to be served 😍",
    served: "Enjoy your meal! 🍽️",
  };

  const statusSteps = ["pending", "preparing", "ready", "served"];

  // 🔥 CANCEL POPUP UI
  if (cancelled) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] px-6 py-10 text-white flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#200] border border-red-600 p-8 rounded-2xl text-center shadow-xl"
        >
          <p className="text-3xl font-extrabold text-red-400 mb-3">
            ❌ Order Cancelled
          </p>
          <p className="text-gray-300 mb-6">
            Your order was cancelled by the restaurant.
          </p>

          <button
            onClick={() => (window.location.href = "/menu")}
            className="px-8 py-3 bg-red-500 hover:bg-red-400 rounded-full text-white font-bold"
          >
            Back to Menu
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] px-6 py-10 text-white">

      {/* LOGO */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="flex justify-center"
      >
        <img
          src="/onebite-2.jpg"
          className="w-32 h-32 object-cover rounded-full border-2 border-[#FFB100] shadow-[0_0_25px_rgba(255,177,0,0.5)]"
        />
      </motion.div>

      {/* ORDER STATUS */}
      <div className="text-center mt-6">
        <h1 className="text-3xl font-extrabold text-yellow-400">
          Order Confirmed 🎉
        </h1>

        <p className="mt-2 text-sm font-semibold text-yellow-300">
          {statusText[liveStatus]}
        </p>

        {/* 🔥 PROFESSIONAL PROGRESS TRACKER */}
        <div className="flex justify-center gap-4 mt-5">
          {statusSteps.map((step) => {
            const active = statusSteps.indexOf(step) <= statusSteps.indexOf(liveStatus);
            return (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full transition-all ${
                    active ? "bg-yellow-400 shadow-[0_0_10px_rgba(255,199,0,0.8)]" : "bg-gray-600"
                  }`}
                />
                <p
                  className={`text-[10px] mt-1 transition ${
                    active ? "text-yellow-300" : "text-gray-500"
                  }`}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SUMMARY CARD */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#111] rounded-2xl border border-[#222] shadow-xl p-6 mt-10"
      >
        <h2 className="text-xl font-bold mb-5 text-yellow-400">Order Summary</h2>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item._id}
              className="flex justify-between bg-[#1a1a1a] p-4 rounded-xl border border-[#333]"
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

        <div className="space-y-2 text-[15px]">
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal</span>
            <span className="font-semibold">₹{order.totalPrice}</span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Discount</span>
              <span>-₹{order.discount}</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total Payable</span>
            <span className="text-yellow-400">₹{order.finalPrice}</span>
          </div>
        </div>

        {/* TABLE */}
        <div className="mt-6 bg-yellow-400 text-black p-3 rounded-lg text-center font-extrabold text-lg">
          Table: {order.table || "—"}
        </div>



        {/* BILL BUTTON */}
        <button
          onClick={() => (window.location.href = `/bill/${order._id}`)}
          className="mt-4 w-full bg-[#FF6A3D] hover:bg-[#ff7c50] text-white py-3 rounded-lg font-bold text-sm shadow-lg active:scale-95"
        >
          View Detailed Bill →
        </button>

                {/* 🔥 BILL INFO BANNER */}
        <div className="mt-4 bg-[#222] border border-yellow-500/40 text-yellow-300 text-center p-2 rounded-lg text-sm">
          Payment will be completed on the bill page.
        </div>

        {/* ⭐ RATING */}
        {showRating && (
          <div className="mt-10 text-center">
            <p className="text-gray-300 font-semibold text-sm mb-3">
              Rate your experience ⭐
            </p>

            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.span
                  key={star}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.8 }}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => submitRating(star)}
                  className={`text-3xl cursor-pointer transition ${
                    star <= (hover || rating)
                      ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(255,199,0,0.7)]"
                      : "text-gray-600"
                  }`}
                >
                  ★
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Rating Popup */}
        {popup && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          >
            <div className="bg-[#111] p-8 rounded-2xl border border-yellow-400/30 text-center">
              <p className="text-3xl mb-2">⭐ {rating} / 5</p>
              <p className="text-yellow-400 font-bold text-lg">
                Thank you for your feedback!
              </p>
            </div>
          </motion.div>
        )}

        <p className="text-center text-gray-500 text-xs mt-4">
          {formatDateTime(order.createdAt)}
        </p>
      </motion.div>

      {/* FOOTER */}
      <div className="mt-12 text-center opacity-70">
        <p className="text-xs">© Made with ❤️ by Aman</p>
        <p className="text-[10px] text-gray-500">OneBite Menu System</p>
      </div>

      {/* BACK BUTTON */}
      <div className="mt-8 text-center">
        <button
          onClick={() => (window.location.href = "/menu")}
          className="bg-yellow-400 hover:bg-yellow-300 px-10 py-3 rounded-full text-lg font-bold text-black shadow-[0_0_20px_rgba(255,177,0,0.4)] active:scale-95"
        >
          Back to Menu
        </button>
      </div>
     </div>
  );
}
