"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function OrderSuccessPage() {
  const [order, setOrder] = useState(null);
  const [liveStatus, setLiveStatus] = useState("pending");

  // ⭐ RATING STATES
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [popup, setPopup] = useState(false);

  // Load order
  useEffect(() => {
    const savedOrder = localStorage.getItem("latestOrder");
    if (savedOrder) {
      const parsed = JSON.parse(savedOrder);
      setOrder(parsed);
      setLiveStatus(parsed.status || "pending");
    }
  }, []);

  // Play notification sound (once)
  useEffect(() => {
    const audio = new Audio("/notify.mp3");
    audio.volume = 1;
    audio.play().catch(() => {});
  }, []);

  // ⭐ Show rating only if not submitted
  useEffect(() => {
    const hasRated = localStorage.getItem("onebite_rating_given");
    if (!hasRated) setShowRating(true);
  }, []);

  // ⭐ Submit rating → backend + hide stars
  async function submitRating(star) {
    setRating(star);
    setPopup(true);

    await fetch("/api/rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: star,
        orderId: order?._id,
        phone: order?.customerPhone,
      }),
    });

    localStorage.setItem("onebite_rating_given", "yes");

    setTimeout(() => setShowRating(false), 1200);
  }

  // Live order status poll
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

      {/* ORDER STATUS */}
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

        <div className="border-t border-gray-700 my-5"></div>

        {/* BILL BREAKDOWN */}
        <div className="space-y-2 text-[15px]">
          <div className="flex justify-between">
            <span className="text-gray-400">Subtotal</span>
            <span className="font-semibold">₹{order.totalPrice}</span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>
                Discount {order.couponCode ? `(${order.couponCode})` : ""}
              </span>
              <span>-₹{order.discount}</span>
            </div>
          )}

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

        {/* ⭐⭐⭐⭐⭐ RATING SECTION */}
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
                  className={`text-3xl cursor-pointer transition 
                    ${
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




        {/* POPUP */}
        {popup && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
          >
            <div className="bg-[#111] px-8 py-6 rounded-2xl text-center border border-yellow-400/30 shadow-xl">
              <p className="text-3xl mb-2">⭐ {rating} / 5</p>
              <p className="text-yellow-400 font-bold text-lg">
                Thank you for your feedback!
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Your rating helps us improve 🍽️
              </p>
            </div>
          </motion.div>
        )}

  

        {/* DATE */}
        <p className="text-center text-gray-500 text-xs mt-4">
          {new Date(order.createdAt).toLocaleString()}
        </p>
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
      </motion.div>

      {/* FOOTER */}
      <div className="mt-12 text-center opacity-70">
        <p className="text-xs" >© Made with ❤️ by Aman</p>
        <p className="text-[10px] text-gray-500">OneBite Menu System</p>
      </div>

   
    </div>
  );
}