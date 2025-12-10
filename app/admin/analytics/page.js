"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import useAutoRefresh from "@/app/hooks/useAutoRefresh";

export default function AnalyticsDashboard() {
  const [tab, setTab] = useState("revenue");

  return (
    <div className="p-4 sm:p-6 text-white max-w-6xl mx-auto">
      {/* HEADER */}
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6">
        Analytics Dashboard
      </h1>

      <Link
        href="/admin"
        className="inline-block mb-4 px-4 py-2 rounded-lg bg-[#111] border border-[#222] hover:border-yellow-400"
      >
        ← Back
      </Link>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
        {["revenue", "orders", "items", "customers"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 sm:px-5 py-2 rounded-xl font-semibold border transition-all text-sm sm:text-base
              ${
                tab === t
                  ? "bg-yellow-500 text-black border-yellow-400 shadow-lg"
                  : "bg-[#111] border-[#333] hover:border-yellow-400"
              }`}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="animate-fade">
        {tab === "revenue" && <RevenueSection />}
        {tab === "orders" && <OrdersSection />}
        {tab === "items" && <ItemsSection />}
        {tab === "customers" && <CustomersSection />}
      </div>

      <style jsx>{`
        .animate-fade {
          animation: fade 0.25s ease-in-out;
        }
        @keyframes fade {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  );
}

//////////////////////////////////////////////////////////////////////////////////////
// ⭐ REVENUE SECTION
//////////////////////////////////////////////////////////////////////////////////////

function RevenueSection() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/analytics/revenue?days=${days}`);
    const j = await res.json();
    setData(j.success ? j : null);
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  useAutoRefresh(load, 10000);

  if (!data) return <p className="text-gray-400">Loading revenue…</p>;

  return (
    <>
      {/* TOP */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Revenue Analytics</h2>
          <p className="text-gray-400 text-sm">Sales • Peak Hours • Patterns</p>
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
        <Card
          title="Today Revenue"
          value={`₹${data.todayRevenue}`}
          subtitle={`${data.todayOrders} orders today`}
        />
        <Card
          title="Total Revenue"
          value={`₹${data.totalRevenue}`}
          subtitle={`${data.totalOrders} orders`}
        />
        <Card
          title="Avg Order"
          value={`₹${data.avgOrder}`}
          subtitle="Selected range"
        />
        <Card
          title="Peak Hour"
          value={data.peakHour || "—"}
          subtitle="Most active hour"
        />
      </div>

      {/* CHART */}
      <div className="bg-[#0f0f0f] p-5 rounded-xl border border-gray-800">
        <h3 className="text-sm text-gray-400 mb-2">Revenue Trend</h3>
        <BarChart labels={data.labels} values={data.revenue} color="#ffb100" />
      </div>
    </>
  );
}

//////////////////////////////////////////////////////////////////////////////////////
// ⭐ ORDERS SECTION
//////////////////////////////////////////////////////////////////////////////////////

function OrdersSection() {
  const [range, setRange] = useState(7);
  const [chart, setChart] = useState(null);
  const [recent, setRecent] = useState([]);

  const loadRange = useCallback(async () => {
    const res = await fetch(`/api/analytics/range?days=${range}`);
    const j = await res.json();
    setChart(j.success ? j : null);
  }, [range]);

  const loadRecent = useCallback(async () => {
    const res = await fetch("/api/orders");
    const j = await res.json();
    setRecent(j.orders?.slice(0, 15) || []);
  }, []);

  useEffect(() => {
    loadRange();
    loadRecent();
  }, [loadRange, loadRecent]);

  useAutoRefresh(() => {
    loadRange();
    loadRecent();
  }, 10000);

  return (
    <>
      {/* HEADER */}
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

      {/* CHART */}
      <div className="bg-[#0f0f0f] p-5 rounded-xl border border-gray-800 mb-6">
        <h3 className="text-sm text-gray-400 mb-3">Orders Trend</h3>

        {chart ? (
          <BarChart labels={chart.labels} values={chart.counts} color="#3b82f6" />
        ) : (
          <p>Loading chart…</p>
        )}
      </div>

      {/* RECENT */}
      <h3 className="text-lg font-semibold mb-3">Recent Orders</h3>

      <div className="space-y-3">
        {recent.map((o) => (
          <div
            key={o._id}
            className="bg-[#111] p-4 rounded-xl border border-gray-800"
          >
            <div className="flex justify-between flex-wrap">
              <div className="font-semibold">{o.customerName || "Guest"}</div>
              <div className="text-xs text-gray-400">
                {new Date(o.createdAt).toLocaleString()}
              </div>
            </div>

            <p className="text-sm text-gray-400 mt-1">
              ₹{o.finalPrice} • {o.items.length} items
            </p>
            <p className="text-xs text-gray-500">Status: {o.status}</p>
          </div>
        ))}
      </div>
    </>
  );
}

//////////////////////////////////////////////////////////////////////////////////////
// ⭐ ITEMS SECTION
//////////////////////////////////////////////////////////////////////////////////////

function ItemsSection() {
  const [top, setTop] = useState([]);
  const [low, setLow] = useState([]);

  const load = useCallback(async () => {
    const t = await (await fetch("/api/analytics/top-items")).json();
    const l = await (await fetch("/api/items/low-stock")).json();
    setTop(t.items || []);
    setLow(l || []);
  }, []);

  useEffect(() => load(), [load]);
  useAutoRefresh(load, 10000);

  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Items Analytics</h2>

      {/* TOP SELLERS */}
      <div className="bg-[#0f0f0f] p-5 rounded-xl border border-gray-800 mb-6">
        <h3 className="font-semibold mb-3">Top Selling Items</h3>

        {top.length === 0 ? (
          <p className="text-gray-400">No sales data yet.</p>
        ) : (
          <div className="space-y-3">
            {top.map((it, i) => (
              <div key={i} className="flex justify-between">
                <div>
                  <div className="font-bold">
                    {i + 1}. {it.name}
                  </div>
                  <div className="text-sm text-gray-400">
                    Qty: {it.qty} • Revenue: ₹{it.revenue}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LOW STOCK */}
      <div className="bg-[#0f0f0f] p-5 rounded-xl border border-gray-800">
        <h3 className="font-semibold mb-3">Low Stock Items</h3>

        {low.length === 0 ? (
          <p className="text-gray-400">All items well stocked 🎉</p>
        ) : (
          <div className="space-y-3">
            {low.map((it) => (
              <div key={it._id} className="flex justify-between">
                <div>
                  <div className="font-bold">{it.name}</div>
                  <div className="text-xs text-gray-400">Stock: {it.stock}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

//////////////////////////////////////////////////////////////////////////////////////
// ⭐ CUSTOMERS SECTION
//////////////////////////////////////////////////////////////////////////////////////

function CustomersSection() {
  const [list, setList] = useState([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/analytics/best-customers");
    const j = await res.json();
    setList(j.customers || []);
  }, []);

  useEffect(() => load(), [load]);
  useAutoRefresh(load, 10000);

  return (
    <>
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Top 10 Customers</h2>

      {list.length === 0 ? (
        <p className="text-gray-400">No customer data yet.</p>
      ) : (
        <div className="space-y-4">
          {list.map((c, i) => (
            <div
              key={i}
              className="bg-[#111] p-4 rounded-xl border border-gray-800"
            >
              <div className="font-bold">
                {i + 1}. {c.phone}
              </div>
              <p className="text-sm text-gray-400">Revenue: ₹{c.revenue}</p>
              <p className="text-xs text-gray-500">{c.orders} orders</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

//////////////////////////////////////////////////////////////////////////////////////
// ⭐ CHART COMPONENT
//////////////////////////////////////////////////////////////////////////////////////

function BarChart({ labels = [], values = [], color }) {
  const safeValues = Array.isArray(values) ? values : [];
  const max = Math.max(...safeValues, 1);

  const height = 180;
  const bar = 20;
  const gap = 14;
  const width = labels.length * (bar + gap);

  return (
    <div className="overflow-x-auto w-full pt-2 pb-1">
      <svg width={Math.max(width + 60, 360)} height={height} className="mx-auto">
        {safeValues.map((v, i) => {
          const h = (v / max) * (height - 50);

          return (
            <g key={i}>
              <rect
                x={i * (bar + gap) + 30}
                y={height - h - 30}
                width={bar}
                height={h}
                rx="4"
                fill={color}
              />

              <text
                x={i * (bar + gap) + 40}
                y={height - h - 38}
                fontSize="10"
                fill="#fff"
                textAnchor="middle"
              >
                {v}
              </text>

              <text
                x={i * (bar + gap) + 40}
                y={height - 10}
                fontSize="10"
                fill="#aaa"
                textAnchor="middle"
              >
                {labels[i]?.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

//////////////////////////////////////////////////////////////////////////////////////
// ⭐ CARD
//////////////////////////////////////////////////////////////////////////////////////

function Card({ title, value, subtitle }) {
  return (
    <div className="bg-[#0d0d0d] p-4 sm:p-5 rounded-xl border border-gray-800">
      <h4 className="text-sm text-gray-400">{title}</h4>
      <div className="text-xl sm:text-2xl font-bold mt-1">{value}</div>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
