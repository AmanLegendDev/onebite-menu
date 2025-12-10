"use client";

import { useEffect, useState } from "react";
import { Timer, Check, XCircle } from "lucide-react";
import Link from "next/link";

export default function PendingOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [declineTarget, setDeclineTarget] = useState(null);

  // ------------------------------------------
  // LOAD ONLY PENDING ORDERS
  // ------------------------------------------
  useEffect(() => {
    loadPending();
    const interval = setInterval(loadPending, 2000); // safe polling
    return () => clearInterval(interval);
  }, []);

  async function loadPending() {
    try {
      const res = await fetch("/api/orders?status=pending", {
        cache: "no-store",
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.log("Pending fetch error:", err);
    }
    setLoading(false);
  }

  // ------------------------------------------
  // ACCEPT ORDER → MOVE TO "preparing"
  // ------------------------------------------
  async function acceptOrder(id) {
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "preparing" }),
      });

      // remove from pending instantly
      setOrders((prev) => prev.filter((o) => o._id !== id));
      setSelectedOrder(null);
    } catch (err) {
      console.log("Accept error:", err);
    }
  }

  // ------------------------------------------
  // DECLINE ORDER → DELETE
  // ------------------------------------------
  async function declineOrder(id) {
    try {
      await fetch(`/api/orders/${id}`, { method: "DELETE" });

      setOrders((prev) => prev.filter((o) => o._id !== id));
      setDeclineTarget(null);
    } catch (err) {
      console.log("Decline error:", err);
    }
  }

  // ------------------------------------------
  // ORDER CARD UI
  // ------------------------------------------
  function OrderCard({ o }) {
    return (
      <div
        onClick={() => setSelectedOrder(o)}
        className="bg-[#111] border border-[#222] rounded-xl p-6 cursor-pointer hover:border-yellow-400 transition"
      >
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Timer size={14} /> {new Date(o.createdAt).toLocaleString()}
        </p>

        <div className="flex justify-between items-center mt-2">
          <h2 className="text-2xl font-bold text-yellow-400">
            {o.tableName || o.table}
          </h2>
          <span className="text-sm text-gray-400">{o.totalQty} items</span>
        </div>

        <p className="text-xl font-bold mt-2">₹{o.totalPrice}</p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(o);
          }}
          className="mt-4 w-full bg-yellow-500 py-2 rounded-lg text-black font-semibold hover:bg-yellow-400 transition"
        >
          Review Order
        </button>
      </div>
    );
  }

  // ------------------------------------------
  // MAIN UI
  // ------------------------------------------
  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-3">Pending Orders</h1>
      <p className="text-gray-400 mb-8">Review & accept incoming orders</p>

      <Link
        href="/admin"
        className="inline-block mb-4 px-4 py-2 rounded-lg bg-[#111] border border-[#222]"
      >
        ← Back
      </Link>

      {loading && <p className="text-gray-400 text-center">Loading…</p>}

      {!loading && orders.length === 0 && (
        <p className="text-center text-gray-500 py-10 text-lg">
          No pending orders.
        </p>
      )}

      {/* ORDER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((o) => (
          <OrderCard key={o._id} o={o} />
        ))}
      </div>

      {/* ------------------------------------------ */}
      {/* MODAL: ORDER DETAILS */}
      {/* ------------------------------------------ */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#0f0f0f] rounded-2xl w-[92%] max-w-lg p-6 border border-[#222] relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 text-3xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-yellow-400">
              Table {selectedOrder.tableName || selectedOrder.table}
            </h2>

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
                  <p className="font-bold text-yellow-400">
                    ₹{i.qty * i.price}
                  </p>
                </div>
              ))}
            </div>

            {/* NOTE */}
            {selectedOrder.note && (
              <p className="mt-4 bg-[#1a1a1a] p-3 rounded-xl text-sm text-gray-300">
                <span className="font-semibold">Note: </span>
                {selectedOrder.note}
              </p>
            )}

            {/* TOTAL */}
            <div className="flex justify-between text-xl font-bold mt-6">
              <p>Total</p>
              <p>₹{selectedOrder.totalPrice}</p>
            </div>

            {/* BUTTONS */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => acceptOrder(selectedOrder._id)}
                className="flex-1 bg-green-600 py-3 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Check size={18} /> Accept
              </button>

              <button
                onClick={() => setDeclineTarget(selectedOrder)}
                className="flex-1 bg-red-600 py-3 rounded-xl hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <XCircle size={18} /> Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------ */}
      {/* DECLINE CONFIRM MODAL */}
      {/* ------------------------------------------ */}
      {declineTarget && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#121212] rounded-2xl w-[90%] max-w-sm p-6 border border-red-700">
            <h2 className="text-xl font-bold text-red-500 mb-3">
              Decline Order?
            </h2>

            <p className="text-gray-300 mb-6">
              Remove order from{" "}
              <span className="font-semibold">
                {declineTarget.tableName || declineTarget.table}
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => declineOrder(declineTarget._id)}
                className="flex-1 bg-red-600 py-2 rounded-lg hover:bg-red-700"
              >
                Decline
              </button>

              <button
                onClick={() => setDeclineTarget(null)}
                className="flex-1 bg-gray-700 py-2 rounded-lg hover:bg-gray-600"
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
