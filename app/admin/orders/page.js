"use client";

import { useEffect, useState } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // for modal

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.log("Orders Fetch Error:", err);
    }
    setLoading(false);
  }

  return (
    <div className="p-6 text-white">

      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Orders</h1>
        <p className="text-gray-400 mt-1">All customer orders in real-time</p>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="text-center py-10 text-gray-400 text-lg">
          Loading orders...
        </div>
      )}

      {/* NO ORDERS */}
      {!loading && orders.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-lg">
          No orders yet 😶
        </div>
      )}

      {/* ORDERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((o) => (
          <div
            key={o._id}
            className="bg-[#111] border border-gray-800 rounded-xl p-5 shadow hover:shadow-xl hover:border-[#ff6a3d] transition cursor-pointer"
            onClick={() => setSelectedOrder(o)}
          >
            {/* TOP ROW */}
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-400">
                {new Date(o.createdAt).toLocaleString()}
              </p>

              <span className="px-3 py-1 text-xs rounded-full bg-green-600/20 text-green-400">
                NEW
              </span>
            </div>

            <h2 className="text-xl font-bold mb-2 text-[#ff6a3d]">
              Table {o.table}
            </h2>

            {/* ITEMS COUNT */}
            <p className="text-gray-300 mb-1">{o.totalQty} items</p>

            {/* TOTAL PRICE */}
            <p className="font-bold text-lg text-white">
              ₹{o.totalPrice}
            </p>
          </div>
        ))}
      </div>

      {/* ---------------- MODAL ---------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-[#111] w-[90%] max-w-lg rounded-xl border border-gray-800 p-6 relative shadow-xl">

            {/* Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-3 text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>

            {/* Header */}
            <h2 className="text-2xl font-bold text-[#ff6a3d]">
              Table {selectedOrder.table}
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </p>

            <div className="h-[1px] bg-gray-700 mb-4" />

            {/* Items */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scroll">
              {selectedOrder.items.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between border-b border-gray-800 pb-2"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-400">
                      {item.qty} × ₹{item.price}
                    </p>
                  </div>

                  <p className="font-semibold text-[#ff6a3d]">
                    ₹{item.qty * item.price}
                  </p>
                </div>
              ))}
            </div>

            <div className="h-[1px] bg-gray-700 my-4" />

            {/* Total */}
            <div className="flex justify-between text-lg font-bold">
              <p>Total</p>
              <p>₹{selectedOrder.totalPrice}</p>
            </div>

            {/* Note */}
            {selectedOrder.note && (
              <p className="mt-3 p-3 bg-gray-900 rounded-lg text-gray-300 text-sm">
                <span className="font-semibold text-white">Note:</span>{" "}
                {selectedOrder.note}
              </p>
            )}

            {/* Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-6 bg-[#ff6a3d] py-3 rounded-xl font-semibold text-white hover:brightness-110 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
