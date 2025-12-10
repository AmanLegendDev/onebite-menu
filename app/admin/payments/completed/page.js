"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Timer, ChevronLeft, ChevronRight } from "lucide-react";

export default function CompletedPaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 20;

  const [hasMore, setHasMore] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  async function loadCompleted(pageNum = 1) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/orders/paginated?page=${pageNum}&limit=${limit}`,
        { cache: "no-store" }
      );
      const data = await res.json();

      const completed = (data.orders || []).filter(
        (o) => o.paymentStatus === "paid"
      );

      setOrders(completed);
      setHasMore(data.hasMore);
      setPage(data.page);
    } catch (err) {
      console.log("Completed payments load error:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadCompleted(1);
  }, []);

  // -----------------------
  // GROUP BY DATE
  // -----------------------
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

  if (loading)
    return (
      <div className="p-10 text-center text-gray-400 text-xl">
        Loading completed payments…
      </div>
    );

  return (
    <div className="p-6 text-white">
      <Link
        href="/admin"
        className="inline-block mb-4 px-4 py-2 rounded-lg bg-[#111] border border-[#222]"
      >
        ← Back
      </Link>

      <h1 className="text-3xl font-bold mb-1">Completed Payments</h1>
      <p className="text-gray-400 mb-6">
        All verified payments with bill & order details.
      </p>

      {orders.length === 0 && (
        <div className="text-center text-gray-400 py-10">
          No completed payments yet.
        </div>
      )}

      {/* GROUPED BY DATE */}
      {dates.map((date) => (
        <div key={date} className="mb-10">
          <h2 className="text-xl font-bold text-green-400 mb-3">{date}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {grouped[date].map((o) => (
              <div
                key={o._id}
                className="bg-[#111] border border-[#222] p-5 rounded-xl shadow-md hover:shadow-green-400/10 transition"
              >
                <div className="flex justify-between mb-3">
                  <h2 className="text-xl font-semibold">₹{o.finalPrice}</h2>
                  <span className="text-green-500 font-bold text-sm">
                    PAID
                  </span>
                </div>

                <p className="text-sm text-gray-300 flex items-center gap-1">
                  <Timer size={14} />
                  {new Date(o.createdAt).toLocaleString()}
                </p>

                <p className="text-gray-300 text-sm mt-1">
                  <b>Table:</b> {o.tableName || o.table}
                </p>
                <p className="text-gray-300 text-sm">
                  <b>Customer:</b> {o.customerName || "Unknown"}
                </p>
                <p className="text-gray-300 text-sm">
                  <b>Phone:</b> {o.customerPhone || "-"}
                </p>

                <p className="text-gray-400 text-xs mt-1">
                  KOT: {o.kotId || "N/A"}
                </p>
                <p className="text-gray-400 text-xs">
                  Mode: {o.paymentMethod?.toUpperCase() || "NOT SELECTED"}
                </p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setSelectedOrder(o)}
                    className="flex-1 bg-green-600 py-2 rounded-lg text-sm font-semibold"
                  >
                    Details
                  </button>

                  <Link
                    href={`/admin/orders/bill/${o._id}`}
                    className="flex-1 bg-[#222] py-2 rounded-lg flex items-center justify-center gap-1 text-sm"
                  >
                    <FileText size={16} />
                    Bill
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* PAGINATION */}
      <div className="flex justify-center gap-4 mt-10">
        <button
          disabled={page === 1}
          onClick={() => loadCompleted(page - 1)}
          className={`px-4 py-2 rounded-lg bg-[#111] border ${
            page === 1 ? "border-[#333] text-gray-500" : "border-[#222]"
          }`}
        >
          <ChevronLeft />
        </button>

        <button
          disabled={!hasMore}
          onClick={() => loadCompleted(page + 1)}
          className={`px-4 py-2 rounded-lg bg-[#111] border ${
            !hasMore ? "border-[#333] text-gray-500" : "border-[#222]"
          }`}
        >
          <ChevronRight />
        </button>
      </div>

      {/* DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111] p-6 rounded-xl w-[90%] max-w-lg border border-[#333] relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-4 text-gray-400 text-xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold mb-2">
              Table {selectedOrder.tableName}
            </h2>

            <p className="text-sm text-gray-400 mb-4">
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </p>

            <div className="max-h-72 overflow-y-auto pr-2 space-y-3">
              {selectedOrder.items.map((it) => (
                <div
                  key={it._id}
                  className="flex justify-between border-b border-[#333] pb-2"
                >
                  <div>
                    <p className="font-semibold">{it.name}</p>
                    <p className="text-xs text-gray-500">
                      {it.qty} × ₹{it.price}
                    </p>
                  </div>
                  <p className="font-bold text-green-400">
                    ₹{it.qty * it.price}
                  </p>
                </div>
              ))}
            </div>

            {selectedOrder.note && (
              <p className="mt-3 bg-[#1a1a1a] p-3 rounded text-sm text-gray-300">
                <b>Note:</b> {selectedOrder.note}
              </p>
            )}

            <div className="flex justify-between text-xl font-bold mt-4">
              <span>Total</span>
              <span className="text-green-400">₹{selectedOrder.finalPrice}</span>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-6 bg-gray-700 py-2 rounded-lg font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
