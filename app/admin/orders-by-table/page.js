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

      if (data.success) {
        const filtered = {};

        Object.entries(data.groups).forEach(([key, group]) => {
          // Only unpaid orders allowed here
          const unpaid = group.orders.filter(
            (o) => o.paymentStatus !== "paid"
          );

          if (unpaid.length > 0) {
            filtered[key] = { ...group, orders: unpaid };
          }
        });

        setGroups(filtered);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadTableOrders();
    const interval = setInterval(loadTableOrders, 2500);
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
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-extrabold mb-5">🍽 Active Table Orders</h1>
      <p className="text-gray-400 mb-8">Live overview of unpaid tables</p>
        <Link
        href="/admin"
        className="inline-block mb-4 px-4 py-2 rounded-lg bg-[#111] border border-[#222]"
      >
        ← Back
      </Link>

      {entries.length === 0 && (
        <p className="text-gray-500 text-lg font-semibold">
          All tables are free 🎉
        </p>
      )}

      {/* TABLE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map(([key, group], index) => {
          const orders = group.orders;
          const latest = orders[0];

          return (
            <div
              key={index}
              className="bg-[#0e0e0e] rounded-xl shadow-lg border border-[#3a3a3a] p-5 
              hover:border-yellow-400 hover:shadow-yellow-700/30 transition"
            >
              <h2 className="text-xl font-bold text-yellow-400">
                {group.tableName}
              </h2>

              <p className="text-gray-300 mt-1">
                Active Orders: <b>{orders.length}</b>
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Last Order: {timeAgo(latest.createdAt)}
              </p>

              <button
                onClick={() => setModalTable(group)}
                className="mt-5 w-full bg-yellow-500 text-black py-2 rounded-lg font-semibold hover:bg-yellow-400"
              >
                View Orders →
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL - VIEW ONLY */}
      {modalTable && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#111] p-6 rounded-xl border border-gray-700 w-full max-w-lg relative">
            <button
              onClick={() => setModalTable(null)}
              className="absolute right-4 top-4 text-gray-400 text-2xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              {modalTable.tableName} — Active Orders
            </h2>

            <div className="max-h-[350px] overflow-y-auto space-y-4">
              {modalTable.orders.map((o) => (
                <div
                  key={o._id}
                  className="bg-[#1b1b1b] p-4 rounded-lg border border-gray-700"
                >
                  <div className="flex justify-between">
                    <p className="font-bold text-white">
                      KOT #{o.kotId || "N/A"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {timeAgo(o.createdAt)}
                    </p>
                  </div>

                  <p className="font-bold text-lg mt-2">₹{o.totalPrice}</p>

                  <ul className="mt-2 text-sm text-gray-300 space-y-1">
                    {o.items.map((it, idx) => (
                      <li key={idx}>
                        {it.name} × {it.qty}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex justify-end">
                    <Link
                      href={`/admin/orders/bill/${o._id}`}
                      className="text-blue-400 underline text-xs"
                    >
                      View Bill →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* NOTHING HERE. NO BUTTON. VIEW-ONLY. */}
          </div>
        </div>
      )}
    </div>
  );
}
