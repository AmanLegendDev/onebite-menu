"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // -----------------------------
  // LIVE POLLING FOR REALTIME
  // -----------------------------
  useEffect(() => {
    loadOrders(); // initial load

    const interval = setInterval(() => {
      loadOrders(); // every second
    }, 1000);

    return () => clearInterval(interval);
  }, []);

async function loadOrders() {
  try {
    const res = await fetch(
      "/api/orders/paginated?page=1&limit=30",
      { cache: "no-store" }
    );

    const data = await res.json();

    // Agar API se data aaya → 50 orders set karo
if (data.orders && data.orders.length > 0) {

  // ❗ sirf ACTIVE orders dikhane ke liye
  const activeOrders = data.orders.filter(
    (o) => o.status !== "served"
  );

  setOrders(activeOrders);
}

  } catch (err) {
    console.log("Orders Fetch Error:", err);
  }

  setLoading(false);
}


  // -----------------------------
  // DELETE ORDER
  // -----------------------------
  async function deleteOrder(id) {
    try {
      await fetch(`/api/orders/${id}`, { method: "DELETE" });
      setOrders((p) => p.filter((x) => x._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.log("Delete error:", err);
    }
  }

  // -----------------------------
  // MARK ORDER AS SEEN (DB SYNC)
  // -----------------------------
  async function markSeen(orderId) {
    try {
      await fetch(`/api/orders/seen/${orderId}`, {
        method: "PUT",
      });
    } catch (err) {
      console.log("Seen error:", err);
    }
  }

  // -----------------------------
  // GROUP ORDERS
  // -----------------------------
  function groupOrders(list) {
    const today = [];
    const yesterday = [];
    const older = [];

    const now = new Date();
    const d = now.getDate();
    const m = now.getMonth();
    const y = now.getFullYear();

    list.forEach((o) => {
      const date = new Date(o.createdAt);
      const dd = date.getDate();
      const mm = date.getMonth();
      const yy = date.getFullYear();

      if (dd === d && mm === m && yy === y) today.push(o);
      else if (dd === d - 1 && mm === m && yy === y) yesterday.push(o);
      else older.push(o);
    });

    return { today, yesterday, older };
  }

  const { today, yesterday, older } = groupOrders(orders);

  // -----------------------------
  // ORDER CARD
  // -----------------------------
  function OrderCard({ o }) {
    const isNew = !o.seenByAdmin;

    return (
      <div
        key={o._id}
        className="relative bg-[#111] border border-gray-800 rounded-xl p-5 shadow hover:shadow-xl hover:border-[#ff6a3d] transition cursor-pointer"
        onClick={() => {
          setSelectedOrder(o);
          if (isNew) markSeen(o._id); // update DB
        }}
      >
        
         
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteConfirm(o);
          }}
          className="absolute right-3 top-3 text-red-400 hover:text-red-200 text-lg"
        >
          🗑️
        </button>

        <div>
          <p className="text-sm text-gray-400 mb-2">
            {new Date(o.createdAt).toLocaleString()}
          </p>

<div className="flex justify-between">
          <h2 className="text-xl font-bold mb-2 text-[#ff6a3d]">
            Table {o.tableName || o.table}

          </h2>

          {isNew && (
          <span className=" bg-green-600 text-center text-white text-xs px-2 py-2 rounded-full animate-pulse">
            NEW
          </span>
        )}
        </div>

          <p className="text-gray-300 mb-1">{o.totalQty} items</p>
          <p className="font-bold text-lg text-white">₹{o.totalPrice}</p>
        </div>
        <button
  onClick={(e) => {
    e.stopPropagation();
    window.location.href = `/admin/orders/bill/${o._id}`;
  }}
  className="absolute right-3 bottom-5 font-bold bg-[#ff6a3d] hover:bg-blue-700 text-white text-sm px-2 py-1 rounded"
>
  View Bill
</button>



      </div>
    );
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="p-6 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Orders</h1>
        <p className="text-gray-400 mt-1">Realtime restaurant orders</p>
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-400 text-lg">
          Loading orders...
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-lg">
          No orders yet 😶
        </div>
      )}

      {/* TODAY */}
      {today.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-6 mb-3">Today</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {today.map((o) => (
              <OrderCard key={o._id} o={o} />
            ))}
          </div>
        </>
      )}

      {/* YESTERDAY */}
      {yesterday.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-10 mb-3">Yesterday</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {yesterday.map((o) => (
              <OrderCard key={o._id} o={o} />
            ))}
          </div>
        </>
      )}

      {/* OLDER */}
      {older.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-10 mb-3">Older</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {older.map((o) => (
              <OrderCard key={o._id} o={o} />
            ))}
          </div>
        </>
      )}

      {/* MODAL */}
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
  onClick={async (e) => {
    e.stopPropagation();

    const id = selectedOrder._id;

    const res = await fetch(`/api/orders/complete/${id}`, {
      method: "PUT",
    });

    // Backend update ho gaya → ab list fresh reload
    await loadOrders();

    setSelectedOrder(null);
  }}
  className="w-full mt-4 bg-green-600 py-3 rounded-xl font-semibold text-white hover:brightness-110 transition"
>
  ✓ Mark as Completed
</button>




            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-6 bg-[#ff6a3d] py-3 rounded-xl font-semibold text-white hover:brightness-110 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-[#111] w-[90%] max-w-sm rounded-xl border border-gray-800 p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-red-400">
              Delete this order?
            </h2>

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete order for{" "}
              <b>Table {deleteConfirm.table}</b>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => deleteOrder(deleteConfirm._id)}
                className="flex-1 bg-red-600 py-2 rounded-lg text-white font-semibold"
              >
                Yes, delete
              </button>

              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-700 py-2 rounded-lg text-white font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* HISTORY BUTTON */}
<div className="mt-12 flex justify-center">
  <Link
    href="/admin/orders/history"
    className="px-6 py-3 rounded-xl border border-gray-700 bg-[#111] hover:bg-[#1a1a1a] text-sm md:text-base font-semibold text-gray-200 hover:text-white flex items-center gap-2 transition"
  >
    View Full Order History →
  </Link>
</div>

    </div>
  );
}
