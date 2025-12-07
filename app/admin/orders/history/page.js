"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Receipt, Timer, User } from "lucide-react";

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // INITIAL
  useEffect(() => {
    loadOrders(1);
  }, []);

  async function loadOrders(pageToLoad) {
    try {
      const res = await fetch(
        `/api/orders/paginated?page=${pageToLoad}&limit=50`,
        { cache: "no-store" }
      );
      const data = await res.json();

      if (pageToLoad === 1) setOrders(data.orders);
      else setOrders((p) => [...p, ...data.orders]);

      setHasMore(data.hasMore);
      setPage(pageToLoad);
    } catch (err) {
      console.log("History fetch error:", err);
    }

    setLoading(false);
    setLoadingMore(false);
  }

  // GROUP BY DATE
  function groupByDate(list) {
    const groups = {};

    list.forEach((o) => {
      const date = new Date(o.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      if (!groups[date]) groups[date] = [];
      groups[date].push(o);
    });

    return groups;
  }

  const grouped = groupByDate(orders);
  const dates = Object.keys(grouped);

  // CARD UI
  function OrderCard({ o }) {
    const isCompleted = o.status === "served";

    return (
      <div
        onClick={() => setSelectedOrder(o)}
        className="bg-[#0e0e0e] border border-[#1e1e1e] rounded-xl p-6 shadow-lg 
          hover:border-[#ff6a3d] hover:shadow-xl transition cursor-pointer"
      >
        {/* Time */}
        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <Timer size={14} /> {new Date(o.createdAt).toLocaleString()}
        </p>

        {/* Table + Status */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-[#ff6a3d]">
            {o.tableName || o.table}
          </h2>

          {isCompleted ? (
            <span className="text-green-500 font-bold text-lg">✓</span>
          ) : (
            <span className="text-yellow-400 text-xs bg-yellow-900/30 px-2 py-1 rounded-lg">
              Pending
            </span>
          )}
        </div>

        {/* Customer Name */}
        <p className="text-sm text-gray-300 flex items-center gap-2">
          <User size={14} />
          {o.customerName || "Unknown"} — {o.customerPhone}
        </p>

        <p className="text-gray-400 mt-3">{o.totalQty} items</p>

        <div className="flex justify-between items-center mt-2">
          <p className="font-bold text-xl text-white">₹{o.totalPrice}</p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/admin/orders/bill/${o._id}`;
            }}
            className="bg-[#ff6a3d] hover:bg-[#ff7c50] text-white text-sm px-3 py-1 rounded-lg flex items-center gap-1"
          >
            <Receipt size={14} /> Bill
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">

      {/* BACK */}
      <Link
        href="/admin/orders"
        className="inline-block mb-6 px-4 py-2 rounded-lg bg-[#111] border border-[#222] hover:bg-[#1a1a1a]"
      >
        ← Back to Orders
      </Link>

      <h1 className="text-4xl font-extrabold">Order History</h1>
      <p className="text-gray-400 mb-10">
        Complete date-wise restaurant order records
      </p>

      {loading && (
        <div className="text-center text-gray-400 py-10">Loading history...</div>
      )}

      {!loading && orders.length === 0 && (
        <div className="text-center text-gray-500 py-10">No history yet 😶</div>
      )}

      {/* GROUPED SECTIONS */}
      {dates.map((date) => (
        <div key={date} className="mb-14">
          <h2 className="text-xl font-bold text-[#ff6a3d] mb-3">{date}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {grouped[date].map((o) => (
              <OrderCard key={o._id} o={o} />
            ))}
          </div>
        </div>
      ))}

      {/* LOAD MORE */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            disabled={loadingMore}
            onClick={() => {
              setLoadingMore(true);
              loadOrders(page + 1);
            }}
            className="px-6 py-3 rounded-xl bg-[#111] border border-[#222] hover:bg-[#1c1c1c] font-semibold"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/* MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#0f0f0f] w-[90%] max-w-lg p-6 rounded-2xl border border-[#222] shadow-xl relative">

            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-3 text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-[#ff6a3d] mb-1">
              {selectedOrder.tableName || selectedOrder.table}
            </h2>

            <p className="text-gray-400 text-xs mb-3">
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </p>

            {/* Customer */}
            <p className="text-sm text-gray-300 flex items-center gap-2 mb-4">
              <User size={14} />
              {selectedOrder.customerName || "Unknown"} ({selectedOrder.customerPhone})
            </p>

            {/* Items */}
            <div className="max-h-64 overflow-y-auto pr-2 custom-scroll space-y-3">
              {selectedOrder.items.map((it) => (
                <div
                  key={it._id}
                  className="flex justify-between border-b border-gray-800 pb-2"
                >
                  <div>
                    <p className="font-semibold">{it.name}</p>
                    <p className="text-sm text-gray-500">{it.qty} × ₹{it.price}</p>
                  </div>

                  <p className="text-[#ff6a3d] font-bold">
                    ₹{it.qty * it.price}
                  </p>
                </div>
              ))}
            </div>

            {/* Note */}
            {selectedOrder.note && (
              <p className="mt-4 bg-[#1a1a1a] p-3 rounded-xl text-gray-300 text-sm">
                <span className="font-semibold text-white">Note: </span>
                {selectedOrder.note}
              </p>
            )}

            {/* Total */}
            <div className="flex justify-between text-xl font-bold mt-5">
              <p>Total</p>
              <p>₹{selectedOrder.totalPrice}</p>
            </div>

            {/* Close */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-6 bg-[#ff6a3d] hover:bg-[#ff7c50] py-3 rounded-xl font-semibold"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
