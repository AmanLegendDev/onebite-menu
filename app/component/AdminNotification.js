"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminNotification() {
  const [queue, setQueue] = useState([]);
  const [latestId, setLatestId] = useState(null);
  const [current, setCurrent] = useState(null);

  // -------------------------------------------------
  // 🔥 CHECK FOR NEW ORDERS (polling)
  // -------------------------------------------------
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/orders?latest=true", {
          cache: "no-store",
        });
        const data = await res.json();

        if (!data?.orders || data.orders.length === 0) return;

        const newOrder = data.orders[0];

        if (latestId === null) {
          setLatestId(newOrder._id);
          return;
        }

        // new order detected
        if (newOrder._id !== latestId) {
          setLatestId(newOrder._id);
          addToQueue(newOrder);
        }
      } catch (err) {
        console.log("Notification Poll Error:", err);
      }
    };

    const interval = setInterval(check, 2000);
    return () => clearInterval(interval);
  }, [latestId]);

  // -------------------------------------------------
  // Add new order to queue
  // -------------------------------------------------
  function addToQueue(order) {
    setQueue((prev) => [...prev, order]);
  }

  // -------------------------------------------------
  // Play next notification from queue
  // -------------------------------------------------
  useEffect(() => {
    if (!current && queue.length > 0) {
      const next = queue[0];
      setCurrent(next);

      // Sound
      const audio = new Audio("/notify.mp3");
      audio.play().catch(() => {});



      // Mobile vibration

      try {
  if (navigator.vibrate) navigator.vibrate(200);
} catch (e) {}
      

      // Hide after 4 sec
      setTimeout(() => {
        setCurrent(null);
        setQueue((prev) => prev.slice(1));
      }, 4000);
    }
  }, [queue, current]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ x: 300, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 300, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="fixed top-6 right-6 bg-[#111] text-white px-5 py-4 rounded-xl shadow-xl border border-[#ff6a3d] z-[9999]"
        >
          <p className="font-semibold text-lg">
            New Order • Table {current.table}
          </p>

          <p className="text-sm text-gray-300 mt-1">
            {current.totalQty} items • ₹{current.totalPrice}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
