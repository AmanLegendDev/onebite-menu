"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Receipt,
  Timer,
  Trash2,
  ArrowRight,
  CheckSquare,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // -----------------------------------------------------
  // 🔥 REALTIME POLLING
  // -----------------------------------------------------
  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => loadOrders(), 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch("/api/orders/paginated?page=1&limit=30", {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.orders && data.orders.length > 0) {
        const active = data.orders.filter((o) => o.status !== "served");
        setOrders(active);
      }
    } catch (err) {
      console.log("Fetch Error:", err);
    }
    setLoading(false);
  }

  // -----------------------------------------------------
  // DELETE ORDER
  // -----------------------------------------------------
  async function deleteOrder(id) {
    try {
      await fetch(`/api/orders/${id}`, { method: "DELETE" });
      setOrders((p) => p.filter((x) => x._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.log("Delete error:", err);
    }
  }

  // -----------------------------------------------------
  // MARK AS SEEN
  // -----------------------------------------------------
  async function markSeen(id) {
    try {
      await fetch(`/api/orders/seen/${id}`, { method: "PUT" });
    } catch (err) {}
  }

  // -----------------------------------------------------
  // GROUPING LOGIC
  // -----------------------------------------------------
  function groupOrders(list) {
    const today = [];
    const yesterday = [];
    const older = [];

    const now = new Date();
    const d = now.getDate(), m = now.getMonth(), y = now.getFullYear();

    list.forEach((o) => {
      const dt = new Date(o.createdAt);
      if (dt.getDate() === d && dt.getMonth() === m && dt.getFullYear() === y)
        today.push(o);
      else if (dt.getDate() === d - 1) yesterday.push(o);
      else older.push(o);
    });

    return { today, yesterday, older };
  }

  const { today, yesterday, older } = groupOrders(orders);

  // -----------------------------------------------------
  // 🔥 ORDER CARD UI (BEAST MODE)
  // -----------------------------------------------------
  function OrderCard({ o }) {
    return (
      <div
        onClick={() => {
          setSelectedOrder(o);
          if (!o.seenByAdmin) markSeen(o._id);
        }}
        className={`relative bg-[#0e0e0e] border rounded-xl p-6 shadow-xl cursor-pointer 
          transition hover:-translate-y-1 hover:border-[#ff6a3d]
          ${!o.seenByAdmin ? "border-green-700" : "border-[#222]"}
        `}
      >
        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteConfirm(o);
          }}
          className="absolute top-3 right-3 text-red-500 hover:text-red-300"
        >
          <Trash2 size={20} />
        </button>

        {/* Time */}
        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <Timer size={14} /> {new Date(o.createdAt).toLocaleString()}
        </p>

        {/* Table Name */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#ff6a3d]">
            Table {o.tableName || o.table}
          </h2>

          {!o.seenByAdmin && (
            <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
              NEW
            </span>
          )}
        </div>

        {/* Items & Price */}
        <p className="text-gray-300 mt-3">{o.totalQty} items</p>
        <p className="text-xl font-bold mt-1 text-white">₹{o.totalPrice}</p>

        {/* Bill Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/admin/orders/bill/${o._id}`;
          }}
          className="mt-4 w-full bg-[#ff6a3d] py-2 rounded-lg text-white text-sm flex items-center justify-center gap-2 hover:bg-[#ff7c57]"
        >
          <Receipt size={16} /> View Bill
        </button>
      </div>
    );
  }

  // -----------------------------------------------------
  // UI
  // -----------------------------------------------------
  return (
    <div className="p-6 text-white">
      <h1 className="text-4xl font-extrabold mb-2">Orders</h1>
      <p className="text-gray-400 mb-8">Realtime order management</p>

      {loading && <p className="text-center text-gray-400">Loading...</p>}

      {/* GROUPS */}
      {today.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-3">Today</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            {today.map((o) => (
              <OrderCard o={o} key={o._id} />
            ))}
          </div>
        </>
      )}

      {yesterday.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-3">Yesterday</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            {yesterday.map((o) => (
              <OrderCard o={o} key={o._id} />
            ))}
          </div>
        </>
      )}

      {older.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-3">Older</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {older.map((o) => (
              <OrderCard o={o} key={o._id} />
            ))}
          </div>
        </>
      )}

      {/* VIEW HISTORY */}
      <div className="mt-14 flex justify-center">
        <Link
          href="/admin/orders/history"
          className="px-6 py-3 rounded-xl border border-gray-700 bg-[#111] hover:bg-[#1a1a1a] text-sm font-semibold text-gray-200 flex items-center gap-2"
        >
          View Full Order History <ArrowRight size={16} />
        </Link>
      </div>

      {/* ------------------------------- */}
      {/* 🔥 ORDER DETAILS MODAL */}
      {/* ------------------------------- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-[#0f0f0f] rounded-2xl w-[90%] max-w-lg p-6 border border-[#222] shadow-2xl relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-gray-400 text-2xl hover:text-white"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-[#ff6a3d] mb-2">
              Table {selectedOrder.table}
            </h2>

            <p className="text-gray-400 text-xs mb-4">
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </p>

            <div className="max-h-64 overflow-y-auto pr-2 custom-scroll space-y-3">
              {selectedOrder.items.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between border-b border-gray-800 pb-2"
                >
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-gray-500 text-xs">
                      {item.qty} × ₹{item.price}
                    </p>
                  </div>

                  <p className="font-bold text-[#ff6a3d]">
                    ₹{item.qty * item.price}
                  </p>
                </div>
              ))}
            </div>

            {selectedOrder.note && (
              <p className="mt-4 p-3 bg-[#1a1a1a] rounded-xl text-gray-300 text-sm">
                <span className="font-semibold text-white">Note:</span>{" "}
                {selectedOrder.note}
              </p>
            )}

            <div className="flex justify-between text-xl font-bold mt-6">
              <p>Total</p>
              <p>₹{selectedOrder.totalPrice}</p>
            </div>

            <button
              onClick={async () => {
                await fetch(`/api/orders/complete/${selectedOrder._id}`, {
                  method: "PUT",
                });
                await loadOrders();
                setSelectedOrder(null);
              }}
              className="w-full mt-6 bg-green-600 py-3 rounded-xl text-white text-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700"
            >
              <CheckSquare size={20} /> Mark as Completed
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------- */}
      {/* DELETE CONFIRM MODAL */}
      {/* ------------------------------- */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-[#0f0f0f] rounded-2xl w-[90%] max-w-sm p-6 border border-red-700/40 shadow-2xl">
            <h2 className="text-xl font-bold text-red-500 mb-3">
              Delete Order?
            </h2>

            <p className="text-gray-300 mb-6">
              Confirm delete order from{" "}
              <span className="font-semibold">Table {deleteConfirm.table}</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => deleteOrder(deleteConfirm._id)}
                className="flex-1 bg-red-600 py-2 rounded-lg text-white font-semibold"
              >
                Delete
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

    </div>
  );
}
