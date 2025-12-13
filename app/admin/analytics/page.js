"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import useAutoRefresh from "@/app/hooks/useAutoRefresh";
import { formatDateTime } from "@/lib/formatDate"; 
import { Layers, Utensils, TrendingUp, Wallet } from "lucide-react";

/**
 * AnalyticsDashboard — Final version
 * - Uses the backend routes you provided.
 * - Realtime via useAutoRefresh(load, 10s)
 * - Responsive charts using SVG viewBox so it scales on mobile.
 * - All timestamps displayed in Asia/Kolkata (via formatDateTime util).
 */

export default function AnalyticsDashboard() {
  const [tab, setTab] = useState("revenue");

  return (
    <div className="p-4 sm:p-6 text-white max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Analytics Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Live revenue, orders, items & top customers — realtime powered.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin"
            className="inline-block px-3 py-2 rounded-lg bg-[#111] border border-[#222] hover:border-yellow-400"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
        {["revenue", "orders", "items", "customers"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 sm:px-4 py-2 rounded-xl font-semibold text-sm transition
              ${tab === t ? "bg-yellow-500 text-black border border-yellow-400 shadow-lg" : "bg-[#111] border border-[#333] hover:border-yellow-400"}`}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="animate-fade">
        {tab === "revenue" && <RevenueSection />}
        {tab === "orders" && <OrdersSection />}
        {tab === "items" && <ItemsSection />}
        {tab === "customers" && <CustomersSection />}
      </div>

      <style jsx>{`
        .animate-fade { animation: fade 0.18s ease-in-out; }
        @keyframes fade { from { opacity: 0; transform: translateY(4px);} to { opacity: 1; transform: translateY(0);} }
      `}</style>
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// RevenueSection
////////////////////////////////////////////////////////////////////////////////

function RevenueSection() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/range?days=${days}`);
      const j = await res.json();
      if (j && j.success !== false) setData(j);
    } catch (err) {
      console.error("Revenue load error:", err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);
  useAutoRefresh(load, 10000);

  if (loading && !data) return <p className="text-gray-400">Loading revenue…</p>;
  if (!data) return <p className="text-gray-400">No revenue data.</p>;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Revenue Analytics</h2>
          <p className="text-gray-400 text-sm">Realtime sales, peak hours, and trends</p>
        </div>

        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="bg-[#111] p-2 rounded border border-gray-700"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card title="Today Revenue" value={`₹${data.todayRevenue ?? 0}`} subtitle={`${data.todayOrders ?? 0} orders today`} />
        <Card title="Total Revenue" value={`₹${data.totalRevenue ?? 0}`} subtitle={`${data.totalOrders ?? 0} orders`} />
        <Card title="Avg Order" value={`₹${data.avgOrder ?? 0}`} subtitle="Selected range" />
        <Card title="Peak Hour" value={data.peakHour ?? "—"} subtitle="Most active hour" />
      </div>

      {/* Chart */}
      <div className="bg-[#0f0f0f] p-4 sm:p-5 rounded-xl border border-gray-800">
        <h3 className="text-sm text-gray-400 mb-3">Revenue Trend</h3>
        <ResponsiveBarChart labels={data.labels || []} values={data.revenue || []} color="#ffb100" />
      </div>
    </>
  );
}

////////////////////////////////////////////////////////////////////////////////
// OrdersSection
////////////////////////////////////////////////////////////////////////////////

function OrdersSection() {
  const [range, setRange] = useState(7);
  const [chart, setChart] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRange = useCallback(async () => {
    try {
      const res = await fetch(`/api/analytics/range?days=${range}`);
      const j = await res.json();
      setChart(j.success ? j : null);
    } catch (err) {
      console.error("Orders range error:", err);
    }
  }, [range]);

  const loadRecent = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const j = await res.json();
      setRecent(j.orders?.slice(0, 20) || []);
    } catch (err) {
      console.error("Recent orders error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRange(); loadRecent(); }, [loadRange, loadRecent]);
  useAutoRefresh(() => { loadRange(); loadRecent(); }, 7000);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold">Order Analytics</h2>

        <select
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
          className="bg-[#111] p-2 rounded border border-gray-700"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      <div className="bg-[#0f0f0f] p-4 sm:p-5 rounded-xl border border-gray-800 mb-6">
        <h3 className="text-sm text-gray-400 mb-3">Orders Trend</h3>
        {chart ? <ResponsiveBarChart labels={chart.labels || []} values={chart.counts || []} color="#3b82f6" /> : <p className="text-gray-400">Loading chart…</p>}
      </div>

      <h3 className="text-lg font-semibold mb-3">Recent Orders</h3>
      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-400">Loading recent orders…</p>
        ) : recent.length === 0 ? (
          <p className="text-gray-400">No recent orders</p>
        ) : (
          recent.map((o) => (
            <div key={o._id} className="bg-[#111] p-4 rounded-xl border border-gray-800">
              <div className="flex justify-between flex-wrap gap-2">
                <div className="font-semibold">{o.customerName || "Guest"}</div>
                <div className="text-xs text-gray-400">{formatDateTime(o.createdAt)}</div>
              </div>

              <p className="text-sm text-gray-400 mt-1">₹{o.finalPrice ?? o.totalPrice} • {o.items?.length ?? 0} items</p>
              <p className="text-xs text-gray-500 mt-1">Status: <span className="font-medium">{o.status}</span> • Payment: <span className="font-medium">{o.paymentStatus}</span></p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

////////////////////////////////////////////////////////////////////////////////
// ItemsSection
////////////////////////////////////////////////////////////////////////////////

function ItemsSection() {
  const [top, setTop] = useState([]);
  const [low, setLow] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [tRes, lRes] = await Promise.all([
        fetch("/api/analytics/top-items"),
        fetch("/api/items/low-stock"),
      ]);

      const t = await tRes.json();
      const l = await lRes.json();

      setTop(t.items || []);
      // low-stock route returns array (you provided that earlier)
      setLow(Array.isArray(l) ? l : (l.items || []));
    } catch (err) {
      console.error("Items load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useAutoRefresh(load, 10000);

  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Items Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0f0f0f] p-4 rounded-xl border border-gray-800">
          <h3 className="font-semibold mb-3">Top Selling Items</h3>
          {loading ? (
            <p className="text-gray-400">Loading top items…</p>
          ) : top.length === 0 ? (
            <p className="text-gray-400">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {top.map((it, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">{i + 1}. {it.name}</div>
                    <div className="text-sm text-gray-400">Qty: {it.qty} • Revenue: ₹{it.revenue}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#0f0f0f] p-4 rounded-xl border border-gray-800">
          <h3 className="font-semibold mb-3">Low Stock Items</h3>
          {loading ? (
            <p className="text-gray-400">Loading low stock…</p>
          ) : low.length === 0 ? (
            <p className="text-gray-400">All items well stocked 🎉</p>
          ) : (
            <div className="space-y-3">
              {low.map((it) => (
                <div key={it._id || it.id} className="flex justify-between">
                  <div>
                    <div className="font-bold">{it.name}</div>
                    <div className="text-xs text-gray-400">Stock: {it.stock}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

////////////////////////////////////////////////////////////////////////////////
// CustomersSection
////////////////////////////////////////////////////////////////////////////////

function CustomersSection() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics/best-customers");
      const j = await res.json();
      setList(j.customers || []);
    } catch (err) {
      console.error("Best customers error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useAutoRefresh(load, 15000);

  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Top 10 Customers</h2>

      {loading ? (
        <p className="text-gray-400">Loading customers…</p>
      ) : list.length === 0 ? (
        <p className="text-gray-400">No customer data yet.</p>
      ) : (
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {list.map((c, i) => (
    <div
      key={c.phone || i}
      className="bg-[#111] p-4 rounded-xl border border-gray-800 flex flex-col justify-between"
    >
      <div>
        <div className="font-bold">
          {i + 1}. {c.phone}
        </div>
        <p className="text-sm text-gray-400">Revenue: ₹{c.revenue}</p>
        <p className="text-xs text-gray-500">{c.orders} orders</p>
      </div>

      {/* Coupon Action */}
      <Link href={`/admin/customers/${c.phone}/coupon`}>
      <button
        onClick={() => {
          // future: open coupon modal / send coupon
          console.log("Give coupon to", c.phone);
        }}
        
        className="
          mt-4 w-fit px-4 py-2
          bg-yellow-400 text-black
          text-sm font-semibold
          rounded-lg
          hover:bg-yellow-300
          transition
          shadow-md hover:shadow-yellow-400/30
        "
      >
        🎁 Give Coupon
      </button>
      </Link>
    </div>
  ))}
</div>

      )}
    </>
  );
}

////////////////////////////////////////////////////////////////////////////////
// ResponsiveBarChart component — scales to container using viewBox
////////////////////////////////////////////////////////////////////////////////

function ResponsiveBarChart({ labels = [], values = [], color = "#ffb100" }) {
  // Basic layout math
  const bar = 20;
  const gap = 16;
  const paddingLeft = 30;
  const paddingRight = 30;
  const chartHeight = 180;

  const count = Math.max(labels.length, 1);
  const vbWidth = paddingLeft + paddingRight + count * (bar + gap);
  const maxVal = Math.max(...(values.length ? values : [1]));

  // Prevent too small bars when only 1-2 labels: set minimal width
  const minVbWidth = Math.max(vbWidth, 360);

  return (
    <div className="overflow-x-auto w-full">
      <svg
        width="100%"
        viewBox={`0 0 ${minVbWidth} ${chartHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto"
      >
        {/* Background grid lines */}
        <g>
          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
            const y = 20 + (1 - p) * (chartHeight - 60);
            return <line key={i} x1="0" x2={minVbWidth} y1={y} y2={y} stroke="#191919" strokeWidth="1" />;
          })}
        </g>

        {values.map((v, i) => {
          const h = (v / (maxVal || 1)) * (chartHeight - 80);
          const x = paddingLeft + i * (bar + gap);
          const y = chartHeight - h - 30;

          return (
            <g key={i}>
              <rect x={x} y={y} width={bar} height={h} rx="4" fill={color} />
              <text x={x + bar / 2} y={y - 6} fontSize="10" fill="#fff" textAnchor="middle">{v}</text>
              <text x={x + bar / 2} y={chartHeight - 10} fontSize="10" fill="#aaa" textAnchor="middle">
                {String(labels[i] || "").slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
// Small Card
////////////////////////////////////////////////////////////////////////////////

function Card({ title, value, subtitle }) {
  return (
    <div className="bg-[#0d0d0d] p-4 rounded-xl border border-gray-800 min-h-[86px]">
      <h4 className="text-sm text-gray-400">{title}</h4>
      <div className="text-xl sm:text-2xl font-bold mt-1">{value}</div>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}
