"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, FileText, Timer } from "lucide-react";
export const dynamic = "force-dynamic";


export default function SimpleOrdersHistory() {
  const [orders, setOrders] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();

      // ⭐ FILTER at SOURCE — only fully completed orders
      const completed = (data.orders || []).filter(
        (o) => o.status === "served" && o.paymentStatus === "paid"
      );

      // Sort newest → oldest
      const sorted = completed.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(sorted);
    } catch (err) {
      console.log("History load error:", err);
    }
    setLoading(false);
  }

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

  // SEARCH FILTER
  const filtered = searchDate
    ? orders.filter(
        (o) => new Date(o.createdAt).toLocaleDateString("en-CA") === searchDate
      )
    : orders;

  const grouped = groupByDate(filtered);
  const dates = Object.keys(grouped);

  return (
    <div className="p-4 sm:p-6 text-white">
      {/* HEADER */}
      <Link
        href="/admin"
        className="inline-block mb-4 px-4 py-2 rounded-lg bg-[#111] border border-[#222]"
      >
        ← Back
      </Link>

      <h1 className="text-3xl font-bold mb-1">Completed Order History</h1>
      <p className="text-gray-400 mb-6">
        Only fully served + fully paid orders appear here.
      </p>

      {/* SEARCH */}
      <div className="flex items-center gap-3 mb-6 bg-[#111] px-3 py-3 rounded-xl border border-[#222]">
        <Search className="text-gray-400" size={20} />
        <input
          type="date"
          className="bg-transparent outline-none flex-1 text-white"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
        {searchDate && (
          <button
            className="text-sm text-gray-400"
            onClick={() => setSearchDate("")}
          >
            Clear
          </button>
        )}
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-gray-400 text-center mt-10">Loading history…</p>
      )}

      {/* EMPTY */}
      {!loading && dates.length === 0 && (
        <p className="text-gray-400 text-center mt-10">
          No completed orders found.
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
                        {new Date(o.createdAt).toLocaleString()}
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

                      {/* STATUS */}
                      <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-600">
                        COMPLETED
                      </span>
                    </div>

                    {/* BILL BUTTON */}
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
