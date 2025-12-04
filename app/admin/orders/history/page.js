"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// --------------------------------------------------
// HISTORY PAGE
// --------------------------------------------------
export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // -----------------------------
  // INITIAL LOAD
  // -----------------------------
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

      if (pageToLoad === 1) {
        setOrders(data.orders);
      } else {
        setOrders((prev) => [...prev, ...data.orders]);
      }

      setHasMore(data.hasMore);
      setPage(pageToLoad);
    } catch (err) {
      console.log("History fetch error:", err);
    }

    setLoading(false);
    setLoadingMore(false);
  }

  // -----------------------------
  // GROUP ORDERS BY DATE
  // -----------------------------
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

  // -----------------------------
  // ORDER CARD
  // -----------------------------
  function OrderCard({ o }) {
    return (
      <div
        className="bg-[#111] border border-gray-800 rounded-xl p-5 shadow hover:shadow-xl hover:border-[#ff6a3d] transition cursor-pointer"
        onClick={() => setSelectedOrder(o)}
      >
        <p className="text-sm text-gray-400 mb-2">
          {new Date(o.createdAt).toLocaleString()}
        </p>

        <h2 className="text-xl font-bold mb-2 text-[#ff6a3d]">
          Table {o.table}
        </h2>

        <p className="text-gray-300 mb-1">{o.totalQty} items</p>

<div className="flex justify-between">
<p className="font-bold text-lg text-white">₹{o.totalPrice}</p>
    
        <button
  onClick={(e) => {
    e.stopPropagation();
    window.location.href = `/admin/orders/bill/${o._id}`;
  }}
  className=" font-bold bg-[#ff6a3d] hover:bg-blue-700 text-white text-sm px-2 py-1 rounded"
>
  View Bill
</button>
</div>
        


      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="p-6 text-white">

      {/* BACK BUTTON */}
      <Link
        href="/admin/orders"
        className="inline-block mb-6 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm"
      >
        ← Back to Orders
      </Link>

      <h1 className="text-3xl font-extrabold tracking-tight">
        Order History
      </h1>
      <p className="text-gray-400 mt-1 mb-10">
        Full date-wise history of all restaurant orders
      </p>

      {loading && (
        <div className="text-center py-10 text-gray-400 text-lg">
          Loading history...
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-lg">
          No order history yet 😶
        </div>
      )}

      {/* DATE GROUPS */}
      {dates.map((date) => (
        <div key={date} className="mb-12">
          <h2 className="text-xl font-bold mb-3 text-[#ff6a3d]">{date}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {grouped[date].map((o) => (
              <OrderCard key={o._id} o={o} />
            ))}
          </div>
        </div>
      ))}

      {/* LOAD MORE BUTTON */}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            disabled={loadingMore}
            onClick={() => {
              setLoadingMore(true);
              loadOrders(page + 1);
            }}
            className="px-6 py-3 rounded-xl bg-[#222] border border-gray-700 hover:bg-[#333] font-semibold text-white transition"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/* ----------------------------- */}
      {/* MODAL DETAIL VIEW */}
      {/* ----------------------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-[#111] w-[90%] max-w-lg rounded-xl border border-gray-800 p-6 relative shadow-xl">

            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-3 text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-[#ff6a3d]">
              Table {selectedOrder.table}
            </h2>

            <p className="text-gray-400 text-sm mb-4">
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </p>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scroll">
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

            {selectedOrder.note && (
              <p className="mt-4 p-3 bg-gray-900 rounded-lg text-gray-300 text-sm">
                <span className="font-semibold text-white">Note:</span>{" "}
                {selectedOrder.note}
              </p>
            )}

            <div className="flex justify-between text-lg font-bold mt-4">
              <p>Total</p>
              <p>₹{selectedOrder.totalPrice}</p>
            </div>

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
