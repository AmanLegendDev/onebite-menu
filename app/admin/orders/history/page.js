"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, FileText, Timer } from "lucide-react";

export const dynamic = "force-dynamic";

/* ------------------ DATE HELPERS (IMPORTANT) ------------------ */

// Mongo UTC → Local YYYY-MM-DD (browser compatible)
function getLocalDateKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // YYYY-MM-DD
}

// For UI heading (human readable)
function displayDate(dateKey) {
  const d = new Date(dateKey);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Full date + time for row
function formatDateTime(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Group orders by local date
function groupByDate(list) {
  const groups = {};
  list.forEach((o) => {
    const key = getLocalDateKey(o.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(o);
  });
  return groups;
}

/* ------------------ COMPONENT ------------------ */

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
console.log(
  data.orders?.map(o => ({
    status: o.status,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt
  }))
);

      // ✅ Only fully completed orders
      const completed = (data.orders || []).filter(
        (o) => o.status === "served" && o.paymentStatus === "paid"
      );

      // Newest → Oldest
      completed.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(completed);
    } catch (err) {
      console.error("History load error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Date filter (timezone safe)
  const filtered = searchDate
    ? orders.filter((o) => getLocalDateKey(o.createdAt) === searchDate)
    : orders;

  const grouped = groupByDate(filtered);
  const dates = Object.keys(grouped).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return (
    <div className="p-4 sm:p-6 text-white">
      {/* BACK */}
      <Link
        href="/admin"
        className="inline-block mb-4 px-4 py-2 rounded-lg bg-[#111] border border-[#222]"
      >
        ← Back
      </Link>

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-1">Completed Order History</h1>
      <p className="text-gray-400 mb-6">
        Only fully served and fully paid orders are shown.
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

      {/* STATES */}
      {loading && (
        <p className="text-gray-400 text-center mt-10">
          Loading order history…
        </p>
      )}

      {!loading && dates.length === 0 && (
        <p className="text-gray-400 text-center mt-10">
          No completed orders found.
        </p>
      )}

      {/* ORDERS */}
      <div className="space-y-10">
        {dates.map((dateKey) => (
          <div key={dateKey}>
            <h2 className="text-xl font-bold text-green-400 mb-3">
              {displayDate(dateKey)}
            </h2>

            <div className="space-y-3">
              {grouped[dateKey].map((o) => (
                <div
                  key={o._id}
                  className="bg-[#0f0f0f] p-4 rounded-xl border border-[#222]"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-gray-400 flex items-center gap-1">
                        <Timer size={14} />
                        {formatDateTime(o.createdAt)}
                      </div>

                      <h3 className="text-xl font-semibold mt-1 text-white">
                        { o.table}
                      </h3>

                      <p className="text-gray-400 text-sm mt-1">
                        {o.totalQty} items • ₹{o.totalPrice}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        KOT: {o.kotId || "N/A"}
                      </p>

                      <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-600">
                        COMPLETED
                      </span>
                    </div>

                    {/* BILL */}
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
