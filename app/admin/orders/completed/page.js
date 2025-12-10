"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Timer, CheckCircle2 } from "lucide-react";

export default function CompletedOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompleted();
  }, []);

  async function loadCompleted() {
    try {
      const res = await fetch("/api/orders?status=served", { cache: "no-store" });
      const data = await res.json();

      const sorted = (data.orders || []).sort(
        (a, b) =>
          new Date(b.completedAt || b.createdAt) -
          new Date(a.completedAt || a.createdAt)
      );

      setOrders(sorted);
    } catch (err) {
      console.log("Completed load error:", err);
    }

    setLoading(false);
  }

  function groupByDate(list) {
    const groups = {};

    list.forEach((o) => {
      const dt = new Date(o.completedAt || o.createdAt);
      const date = dt.toLocaleDateString("en-IN", {
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

  return (
    <div className="p-4 sm:p-6 text-white">
      {/* BACK BUTTON */}
      <Link
        href="/admin"
        className="inline-block mb-4 px-4 py-2 rounded-lg bg-[#111] border border-[#222]"
      >
        ← Back
      </Link>

      <h1 className="text-3xl font-bold mb-1">Completed Orders</h1>
      <p className="text-gray-400 mb-6">
        Only orders marked as <span className="text-green-400 font-semibold">Served</span> appear here.
      </p>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-400 mt-10">Loading…</p>
      )}

      {/* EMPTY */}
      {!loading && orders.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No completed orders yet.
        </p>
      )}

      {/* GROUPED ORDERS */}
      <div className="space-y-10">
        {dates.map((date) => (
          <div key={date}>
            <h2 className="text-xl font-bold text-green-400 mb-3">{date}</h2>

            <div className="space-y-3">
              {grouped[date].map((o) => (
                <div
                  key={o._id}
                  className="bg-[#0f0f0f] p-4 rounded-xl border border-[#222]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-gray-400 flex items-center gap-1">
                        <Timer size={14} />
                        {new Date(o.completedAt || o.createdAt).toLocaleString()}
                      </div>

                      <h3 className="text-xl font-semibold mt-1 text-white">
                        Table {o.tableName || o.table}
                      </h3>

                      <p className="text-gray-400 text-sm mt-1">
                        {o.totalQty} items • ₹{o.totalPrice}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        KOT: {o.kotId || "N/A"}
                      </p>

                      <span className="inline-flex items-center gap-1 bg-green-700/40 text-green-300 px-3 py-1 rounded-full text-xs font-semibold mt-2">
                        <CheckCircle2 size={14} />
                        Served
                      </span>
                    </div>

                    {/* BILL BTN */}
                    <Link
                      href={`/admin/orders/bill/${o._id}`}
                      className="px-3 py-2 rounded-lg bg-[#222] hover:bg-[#333] text-white flex items-center gap-1"
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
      </div>

      <div className="h-10" />
    </div>
  );
}
