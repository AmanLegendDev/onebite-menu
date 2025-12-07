"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrdersByTablePage() {
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalTable, setModalTable] = useState(null);

  async function loadTableOrders() {
    try {
      const res = await fetch("/api/orders/by-table", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setGroups(data.groups);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadTableOrders();
    const interval = setInterval(loadTableOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="text-center p-10 text-gray-400 text-xl">
        Loading table orders...
      </div>
    );

  const entries = Object.entries(groups);

  function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h`;
  }

  // COLORS
  const statusColors = {
    pending: "bg-green-600",
    new: "bg-green-600",
    preparing: "bg-yellow-500",
    ready: "bg-blue-600",
    served: "bg-gray-600",
  };

  // UPDATE STATUS + AUTO CLOSE MODAL
  async function updateStatus(orderId, status) {
    await fetch(`/api/orders/update-status/${orderId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });

    // Refresh cards
    await loadTableOrders();

    // Auto close modal → instant UX
    setModalTable(null);
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-5">🍽 Table-wise Orders</h1>
      <p className="text-gray-400 mb-8">Live overview of all active tables</p>

      {entries.length === 0 && (
        <p className="text-gray-500">No active orders.</p>
      )}

      {/* TABLE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map(([key, group], index) => {
          const orders = group.orders;
          const latest = orders[0];

          // 🔥 NEW → Multiple statuses summary
          const statusSummary = [
            ...new Set(orders.map((o) => o.status.toUpperCase())),
          ].join(" • ");

          return (
            <div
              key={index}
              className="bg-[#111] rounded-xl shadow-lg border border-gray-800 p-5 hover:border-[#ff6a3d] transition relative"
            >
              {!latest.seenByAdmin && (
                <span className="absolute right-3 top-3 bg-green-500 px-2 py-1 rounded text-xs text-white animate-pulse">
                  NEW
                </span>
              )}

              <h2 className="text-xl font-bold text-[#ff6a3d]">
                {group.tableName}
              </h2>

              <p className="text-gray-500 mt-1">
                {orders.length} active order(s)
              </p>

              {/* Status Summary */}
              <p className="text-sm text-gray-300 mt-2">
                Status: <b className="text-white">{statusSummary}</b>
              </p>

              <div className="mt-4">
                <p className="font-bold text-lg">₹{latest.totalPrice}</p>
                <p className="text-sm text-gray-400">
                  {timeAgo(latest.createdAt)} ago
                </p>
              </div>

              <button
                onClick={() => setModalTable(group)}
                className="mt-5 w-full bg-[#ff6a3d] py-2 rounded-lg font-semibold"
              >
                View All Orders →
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL WITH INDIVIDUAL ORDER CONTROL */}
      {modalTable && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#111] p-6 rounded-xl border border-gray-800 w-full max-w-lg relative">
            <button
              onClick={() => setModalTable(null)}
              className="absolute right-4 top-4 text-gray-400 text-2xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-[#ff6a3d] mb-4">
              {modalTable.tableName} — Orders
            </h2>

            <div className="max-h-[350px] overflow-y-auto space-y-4">
              {modalTable.orders.map((o) => {
                const color = statusColors[o.status] || "bg-gray-700";

                return (
                  <div
                    key={o._id}
                    className="bg-[#1b1b1b] p-4 rounded-lg border border-gray-700"
                  >
                    <div className="flex justify-between">
                      <p className="font-bold text-white">
                        Order #{o._id.slice(-4)}
                      </p>
                      <span
                        className={`px-3 py-1 text-xs rounded-full text-white ${color}`}
                      >
                        {o.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-400">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>

                    <p className="font-bold text-lg mt-1">₹{o.totalPrice}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => updateStatus(o._id, "preparing")}
                        className="bg-yellow-600 px-3 py-2 rounded-lg text-xs"
                      >
                        Mark Preparing
                      </button>

                      <button
                        onClick={() => updateStatus(o._id, "ready")}
                        className="bg-blue-600 px-3 py-2 rounded-lg text-xs"
                      >
                        Mark Ready
                      </button>

                      <button
                        onClick={() => updateStatus(o._id, "served")}
                        className="bg-green-700 px-3 py-2 rounded-lg text-xs"
                      >
                        Mark Served
                      </button>

                      <Link
                        href={`/admin/orders/bill/${o._id}`}
                        className="text-blue-400 underline text-xs ml-auto"
                      >
                        View Bill →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setModalTable(null)}
              className="w-full mt-5 bg-[#ff6a3d] py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
