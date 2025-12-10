"use client";

import { useEffect, useState } from "react";
import { Timer, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PreparingOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmReady, setConfirmReady] = useState(null);

  // ------------------------------------------------
  // LOAD ONLY PREPARING ORDERS
  // ------------------------------------------------
  useEffect(() => {
    loadPreparing();
    const interval = setInterval(loadPreparing, 1200);
    return () => clearInterval(interval);
  }, []);

  async function loadPreparing() {
    try {
      const res = await fetch("/api/orders?status=preparing", {
        cache: "no-store",
      });

      const data = await res.json();

      // ⭐ NEW → latest first
      const sorted = (data.orders || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sorted);
    } catch (err) {
      console.log("Prepare fetch error:", err);
    }
    setLoading(false);
  }

  // ------------------------------------------------
  // MARK READY → status = "ready"
  // ------------------------------------------------
  async function markReady(id) {
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ready" }),
      });

      // ⭐ NEW → instantly remove from UI
      setOrders(prev => prev.filter(o => o._id !== id));

      setConfirmReady(null);
      setSelectedOrder(null);
    } catch (err) {
      console.log("Ready error:", err);
    }
  }

  // ------------------------------------------------
  // ORDER CARD COMPONENT
  // ------------------------------------------------
  function OrderCard({ o }) {
    return (
      <div
        onClick={() => setSelectedOrder(o)}
        className="bg-[#111] border border-[#222] rounded-xl p-6 cursor-pointer hover:border-blue-400 transition"
      >
        {/* Time */}
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Timer size={14} /> {new Date(o.createdAt).toLocaleString()}
        </p>

        {/* ⭐ KOT Number */}
        <p className="text-xs text-blue-300 font-semibold mt-1">
          KOT: {o.kotId || "N/A"}
        </p>

        <div className="flex justify-between items-center mt-2">
          <h2 className="text-2xl font-bold text-blue-400">
            {o.tableName || o.table}
          </h2>
          <span className="text-sm text-gray-400">
            {o.totalQty} items
          </span>
        </div>

        <p className="text-xl font-bold mt-2 text-white">₹{o.totalPrice}</p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(o);
          }}
          className="mt-4 w-full bg-blue-600 py-2 rounded-lg text-white text-sm font-semibold hover:bg-blue-700 transition"
        >
          View Order
        </button>
      </div>
    );
  }

  // ------------------------------------------------
  // UI
  // ------------------------------------------------
  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-3">Preparing Orders</h1>
      <p className="text-gray-400 mb-8">Kitchen in progress…</p>
  <Link
        href="/admin"
        className="inline-block mb-4 px-4 py-2 rounded-lg bg-[#111] border border-[#222]"
      >
        ← Back
      </Link>
      {loading && <p className="text-gray-400 text-center">Loading…</p>}

      {!loading && orders.length === 0 && (
        <p className="text-center text-gray-500 py-10 text-lg">
          No preparing orders.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((o) => (
          <OrderCard key={o._id} o={o} />
        ))}
      </div>

      {/* --------------------------------------------- */}
      {/* ORDER DETAILS MODAL */}
      {/* --------------------------------------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-[#0f0f0f] rounded-2xl w-[92%] max-w-lg p-6 border border-[#222] shadow-xl relative">

            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 text-3xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-blue-400">
              Table: {selectedOrder.tableName}
            </h2>

            {/* ⭐ KOT NUMBER */}
            <p className="text-xs text-blue-300 mt-1">
              KOT No: {selectedOrder.kotId}
            </p>

            <p className="text-xs text-gray-500">
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </p>

            <div className="max-h-64 overflow-y-auto mt-5 space-y-3">
              {selectedOrder.items.map((i) => (
                <div
                  key={i._id}
                  className="flex justify-between border-b border-gray-800 pb-2"
                >
                  <div>
                    <p className="font-semibold">{i.name}</p>
                    <p className="text-xs text-gray-500">
                      {i.qty} × ₹{i.price}
                    </p>
                  </div>
                  <p className="font-bold text-blue-400">
                    ₹{i.qty * i.price}
                  </p>
                </div>
              ))}
            </div>

            {selectedOrder.note && (
              <p className="mt-4 bg-[#1a1a1a] p-3 rounded-xl text-sm text-gray-300">
                <span className="font-semibold">Note: </span>
                {selectedOrder.note}
              </p>
            )}

            <div className="flex justify-between text-xl font-bold mt-6">
              <p>Total</p>
              <p>₹{selectedOrder.totalPrice}</p>
            </div>

            <button
              onClick={() => setConfirmReady(selectedOrder)}
              className="mt-6 w-full bg-blue-600 py-3 rounded-xl text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Mark as Ready
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------------------- */}
      {/* CONFIRM READY POPUP */}
      {/* --------------------------------------------- */}
      {confirmReady && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-[#121212] rounded-2xl w-[90%] max-w-sm p-6 border border-blue-700 shadow-xl">
            <h2 className="text-xl font-bold text-blue-400 mb-3">
              Mark as Ready?
            </h2>

            <p className="text-gray-300 mb-6">
              Move this order to the <b>Ready to Serve</b> section?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => markReady(confirmReady._id)}
                className="flex-1 bg-blue-600 py-2 rounded-lg text-white font-semibold hover:bg-blue-700"
              >
                Yes, Continue
              </button>

              <button
                onClick={() => setConfirmReady(null)}
                className="flex-1 bg-gray-700 py-2 rounded-lg text-white font-semibold hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
