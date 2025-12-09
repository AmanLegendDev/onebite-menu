"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminAnalyticsIndex() {
  const [today, setToday] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.all([
        fetch("/api/analytics/today"),
        fetch("/api/analytics/stats"),
      ]);
      const t = await tRes.json();
      const s = await sRes.json();
      setToday(t.success ? t : null);
      setStats(s.success ? s : null);
    } catch (e) {
      console.error("analytics load err", e);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Analytics</h1>
          <p className="text-gray-400 mt-1">Overview • Today & Lifetime</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded bg-[#ff6a3d] font-semibold"
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <Link
            href="/admin/analytics/orders"
            className="px-4 py-2 rounded bg-[#111] border border-gray-700"
          >
            Orders →
          </Link>

          <Link
            href="/admin/analytics/items"
            className="px-4 py-2 rounded bg-[#111] border border-gray-700"
          >
            Items →
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading stats…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            title="Today's Revenue"
            value={today?.totalRevenue ?? "—"}
            subtitle={`${today?.totalOrders ?? 0} orders today`}
          />
          <Card
            title="Avg Order"
            value={today?.avgOrderValue ?? "—"}
            subtitle={`${today?.newCustomersToday ?? 0} new customers`}
          />
          <Card
            title="Lifetime Revenue"
            value={stats?.lifetimeRevenue ?? "—"}
            subtitle={`${stats?.totalCustomers ?? 0} customers`}
          />
          <Card
            title="Best Customer"
            value={
              stats?.bestCustomer
                ? `${stats.bestCustomer.phone} (₹${stats.bestCustomer.revenue})`
                : "—"
            }
            subtitle="Top by revenue"
          />
        </div>
      )}

      <div className="mt-8 text-sm text-gray-400">
        Tip: Use Orders → to accept/prepare/mark ready. Use Items → to manage stock.
      </div>
    </div>
  );
}

function Card({ title, value, subtitle }) {
  return (
    <div className="bg-[#0f0f0f] p-5 rounded-xl border border-gray-800 shadow">
      <h3 className="text-sm text-gray-300">{title}</h3>
      <div className="mt-3 text-2xl font-bold text-white">{value}</div>
      {subtitle && <div className="mt-2 text-xs text-gray-400">{subtitle}</div>}
    </div>
  );
}
