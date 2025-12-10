"use client";

import { useEffect, useState } from "react";

export default function AnalyticsItemsPage() {
  const [items, setItems] = useState([]);
  const [low, setLow] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [topRes, lowRes] = await Promise.all([
        fetch("/api/analytics/top-items"),
        fetch("/api/items/low-stock"), // your low-stock route (create if missing) => return items with stock<=limit
      ]);
      const top = await topRes.json();
      const lowItems = await lowRes.json();
      setItems(top.items || []);
      setLow(Array.isArray(lowItems) ? lowItems : []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  async function adjustStock(itemId) {
    const deltaStr = prompt("Stock change (use +5 or -3):", "+5");
    if (!deltaStr) return;
    const parsed = Number(deltaStr);
    if (isNaN(parsed)) {
      alert("Invalid number");
      return;
    }

    // call your existing stock update route: POST /api/stock/:id with { stockChange }
    try {
      const res = await fetch(`/api/stock/${itemId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockChange: parsed }),
      });
      const j = await res.json();
      if (j.success) {
        alert("Stock updated");
        await load();
      } else alert("Update failed");
    } catch (e) {
      console.error(e);
      alert("Network error");
    }
  }

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-3">Items Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0f0f0f] p-4 rounded-xl border border-gray-800">
          <h3 className="font-semibold mb-3">Top Selling (all time)</h3>
          {loading ? (
            <div className="text-gray-400">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-gray-400">No data</div>
          ) : (
            <div className="space-y-3">
              {items.map((it, idx) => (
                <div key={it.name} className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">{idx + 1}. {it.name}</div>
                    <div className="text-sm text-gray-400">Qty: {it.qty} • Revenue: ₹{it.revenue}</div>
                  </div>

                  <div>
                    <button onClick={() => window.location.href = `/admin/items?search=${encodeURIComponent(it.name)}`} className="px-3 py-1 rounded bg-[#111] border border-gray-700">Open</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#0f0f0f] p-4 rounded-xl border border-gray-800">
          <h3 className="font-semibold mb-3">Low stock items</h3>
          <p className="text-xs text-gray-400 mb-3">Quick adjust or hide / unhide from menu</p>

          {loading ? (
            <div className="text-gray-400">Loading…</div>
          ) : low.length === 0 ? (
            <div className="text-gray-400">No low stock items</div>
          ) : (
            <div className="space-y-3">
              {low.map((it) => (
                <div key={it._id} className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">{it.name}</div>
                    <div className="text-xs text-gray-400">Stock: {it.stock}</div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => adjustStock(it._id)} className="px-3 py-1 rounded bg-green-600">+/- Stock</button>
                    <button onClick={() => window.location.href = `/admin/items/${it._id}/edit`} className="px-3 py-1 rounded bg-[#111] border border-gray-700">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
