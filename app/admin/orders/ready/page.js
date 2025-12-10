"use client";

import { useEffect, useState } from "react";
import { Timer, CheckCircle, Check } from "lucide-react";
import Link from "next/link";

export default function ReadyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmComplete, setConfirmComplete] = useState(null);

  // ------------------------------------------------
  // LOAD ONLY READY ORDERS
  // ------------------------------------------------
  useEffect(() => {
    loadReady();
    const interval = setInterval(loadReady, 1200);
    return () => clearInterval(interval);
  }, []);

  async function loadReady() {
    try {
      const res = await fetch("/api/orders?status=ready", {
        cache: "no-store",
      });

      const data = await res.json();

      const sorted = (data.orders || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sorted);
    } catch (err) {
      console.log("Ready fetch error:", err);
    }
    setLoading(false);
  }

  // ------------------------------------------------
  // COMPLETE → MOVE TO served
  // ------------------------------------------------
  async function markCompleted(id) {
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "served" }),
      });

      // UI update
      setOrders(prev => prev.filter(o => o._id !== id));

      setConfirmComplete(null);
      setSelectedOrder(null);
    } catch (err) {
      console.log("Complete error:", err);
    }
  }

  // ------------------------------------------------
  // ORDER CARD
  // ------------------------------------------------
  function OrderCard({ o }) {
    return (
      <div
        onClick={() => setSelectedOrder(o)}
        className="bg-[#111] border border-[#222] rounded-xl p-6 cursor-pointer hover:border-green-400 transition"
      >
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Timer size={14} /> {new Date(o.createdAt).toLocaleString()}
        </p>

        {/* ⭐ KOT Number */}
        <p className="text-xs text-green-300 font-semibold mt-1">
          KOT: {o.kotId || "N/A"}
        </p>

        <div className="flex justify-between items-center mt-2">
          <h2 className="text-2xl font-bold text-green-400">
            {o.tableName || o.table}
          </h2>
          <span className="text-sm text-gray-400">{o.totalQty} items</span>
        </div>

        <p className="text-xl font-bold mt-2 text-white">₹{o.totalPrice}</p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(o);
          }}
          className="mt-4 w-full bg-green-600 py-2 rounded-lg text-white text-sm font-semibold hover:bg-green-700 transition"
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
      <h1 className="text-3xl font-bold mb-3">Ready to Serve</h1>
      <p className="text-gray-400 mb-8">These orders are ready for delivery</p>
        <Link
        href="/admin"
        className="inline-block mb-4 px-4 py-2 rounded-lg bg-[#111] border border-[#222]"
      >
        ← Back
      </Link>

      {loading && <p className="text-gray-400 text-center">Loading…</p>}

      {!loading && orders.length === 0 && (
        <p className="text-center text-gray-500 py-10 text-lg">
          No ready orders.
        </p>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((o) => (
          <OrderCard key={o._id} o={o} />
        ))}
      </div>

      {/* --------------------------------------------- */}
      {/* MODAL — ORDER DETAILS */}
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

            <h2 className="text-2xl font-bold text-green-400">
              Table: {selectedOrder.tableName}
            </h2>

            <p className="text-xs text-green-300 mt-1">
              KOT: {selectedOrder.kotId}
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
                  <p className="font-bold text-green-400">
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
              onClick={() => setConfirmComplete(selectedOrder)}
              className="mt-6 w-full bg-green-600 py-3 rounded-xl text-white font-bold hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Mark as Completed
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------------------- */}
      {/* CONFIRM COMPLETE POPUP */}
      {/* --------------------------------------------- */}
      {confirmComplete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-[#121212] rounded-2xl w-[90%] max-w-sm p-6 border border-green-700 shadow-xl">
            <h2 className="text-xl font-bold text-green-400 mb-3">
              Complete Order?
            </h2>

            <p className="text-gray-300 mb-6">
              Move this order to <b>Completed Orders</b>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => markCompleted(confirmComplete._id)}
                className="flex-1 bg-green-600 py-2 rounded-lg text-white font-semibold hover:bg-green-700"
              >
                Yes, Complete
              </button>

              <button
                onClick={() => setConfirmComplete(null)}
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
