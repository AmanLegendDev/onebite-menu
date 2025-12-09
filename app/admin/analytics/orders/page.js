"use client";

import { useEffect, useState } from "react";

export default function AnalyticsOrdersPage() {
  const [rangeDays, setRangeDays] = useState(7);
  const [chartData, setChartData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchRange();
    fetchRecentOrders();
  }, [rangeDays]);

  async function fetchRange() {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/range?days=${rangeDays}`);
      const j = await res.json();
      setChartData(j.success ? j : null);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function fetchRecentOrders() {
    try {
      const res = await fetch("/api/orders?latest=false");
      const j = await res.json();
      setOrders(j.orders || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function updateOrderStatus(id, status) {
    setActionLoading((p) => ({ ...p, [id]: true }));
    try {
      await fetch(`/api/orders/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      // optimistic update
      setOrders((prev) => prev.map(o => (o._id === id ? { ...o, status } : o)));
    } catch (e) {
      console.error(e);
      alert("Action failed");
    }
    setActionLoading((p) => ({ ...p, [id]: false }));
  }

  async function markPaid(id) {
    setActionLoading((p) => ({ ...p, [id]: true }));
    try {
      await fetch(`/api/orders/${id}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: `manual-${Date.now()}` }),
      });
      setOrders((prev) => prev.map(o => (o._id === id ? { ...o, paymentStatus: "paid" } : o)));
    } catch (e) {
      console.error(e);
      alert("Mark paid failed");
    }
    setActionLoading((p) => ({ ...p, [id]: false }));
  }

  // Reprint KOT
  async function reprintKOT(kotId) {
    try {
      const res = await fetch(`/api/kot/${kotId}/reprint`, { method: "POST" });
      const j = await res.json();
      if (j.success && j.payload) {
        // For demo: open printable page in new tab
        const w = window.open("", "_blank");
        w.document.write(`<pre>${JSON.stringify(j.payload, null, 2)}</pre>`);
      } else {
        alert("Reprint failed");
      }
    } catch (e) {
      console.error(e);
      alert("Reprint error");
    }
  }

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Orders & Revenue</h2>
          <p className="text-gray-400 text-sm">Range chart & live order actions</p>
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={rangeDays}
            onChange={(e) => setRangeDays(Number(e.target.value))}
            className="bg-[#111] p-2 rounded border border-gray-700"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>
      </div>

      {/* Chart (simple svg bar chart for revenue) */}
      <div className="bg-[#0f0f0f] p-4 rounded-xl border border-gray-800 mb-6">
        <h3 className="text-sm text-gray-300 mb-3">Revenue (last {rangeDays} days)</h3>

        {loading || !chartData ? (
          <div className="text-gray-400">Loading chart…</div>
        ) : (
          <SimpleBarChart labels={chartData.labels} values={chartData.revenue} />
        )}
      </div>

      {/* Recent orders list */}
      <div>
        <h3 className="text-lg font-bold mb-3">Recent Orders</h3>

        <div className="space-y-3">
          {orders.slice(0, 20).map((o) => (
            <div key={o._id} className="bg-[#111] p-4 rounded-xl border border-gray-800 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="font-bold">{o.customerName || "Guest"}</div>
                  <div className="text-xs text-gray-400">• {new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-sm text-gray-300 mt-2">Items: {o.items?.map(i => `${i.name} x${i.qty}`).join(", ")}</div>
                <div className="text-yellow-300 font-bold mt-2">₹{o.finalPrice}</div>
                <div className="text-xs text-gray-400 mt-1">Status: {o.status || "pending"} • Payment: {o.paymentStatus || "pending"}</div>
              </div>

              <div className="flex flex-col gap-2 w-[220px]">
                <button
                  onClick={() => updateOrderStatus(o._id, "accepted")}
                  className="px-3 py-2 rounded bg-green-600 font-semibold"
                  disabled={actionLoading[o._id]}
                >
                  {actionLoading[o._id] ? "..." : "Accept"}
                </button>

                <button
                  onClick={() => updateOrderStatus(o._id, "preparing")}
                  className="px-3 py-2 rounded bg-orange-500 font-semibold"
                  disabled={actionLoading[o._id]}
                >
                  Start Preparing
                </button>

                <button
                  onClick={() => updateOrderStatus(o._id, "ready")}
                  className="px-3 py-2 rounded bg-emerald-500 font-semibold"
                  disabled={actionLoading[o._id]}
                >
                  Mark Ready
                </button>

                <button
                  onClick={() => updateOrderStatus(o._id, "served")}
                  className="px-3 py-2 rounded bg-blue-500 font-semibold"
                  disabled={actionLoading[o._id]}
                >
                  Served
                </button>

                <button
                  onClick={() => updateOrderStatus(o._id, "cancelled")}
                  className="px-3 py-2 rounded bg-red-600 font-semibold"
                  disabled={actionLoading[o._id]}
                >
                  Cancel
                </button>

                <button
                  onClick={() => markPaid(o._id)}
                  className="px-3 py-2 rounded bg-yellow-400 text-black font-semibold"
                >
                  Mark Paid
                </button>

                {o.kotId && (
                  <button
                    onClick={() => reprintKOT(o.kotId)}
                    className="px-3 py-2 rounded bg-gray-700 font-semibold"
                  >
                    Reprint KOT
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* small SVG bar chart component */
function SimpleBarChart({ labels = [], values = [] }) {
  const max = Math.max(...values, 1);
  const width = 600;
  const height = 120;
  const barW = Math.max(6, Math.floor(width / Math.max(1, labels.length)) - 6);

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={Math.max(width, labels.length * (barW + 6))} height={height}>
        {values.map((v, i) => {
          const x = i * (barW + 6);
          const barH = Math.round((v / max) * (height - 30));
          return (
            <g key={i} transform={`translate(${x},0)`}>
              <rect x={0} y={height - barH - 20} width={barW} height={barH} rx="4" fill="#FFB100" />
              <text x={barW / 2} y={height - 6} fontSize="10" fill="#aaa" textAnchor="middle">
                {labels[i]?.slice(5) /* show MM-DD */}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
