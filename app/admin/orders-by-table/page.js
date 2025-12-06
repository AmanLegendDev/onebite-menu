"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrdersByTablePage() {
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);

  async function loadTableOrders() {
    try {
      const res = await fetch("/api/orders/by-table", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setGroups(data.groups);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadTableOrders();

    const interval = setInterval(() => {
      loadTableOrders();
    }, 3000); // refresh every 3 sec

    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="text-center p-10 text-gray-500">
        Loading table orders...
      </div>
    );

  const entries = Object.entries(groups);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-5">Table-wise Active Orders</h1>

      {entries.length === 0 && (
        <p className="text-gray-600">No active orders.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map(([key, group], index) => {
          const orders = group.orders;
          const latest = orders[0];

          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow border p-5 hover:border-yellow-500 transition"
            >
              <h2 className="text-xl font-bold text-yellow-600">
                {group.tableName}
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                {orders.length} active order(s)
              </p>

              <div className="mt-3">
                <p className="font-bold text-gray-800">
                  Total: ₹{latest.totalPrice}
                </p>
                <p className="text-sm text-gray-600">
                  Status: <span className="font-semibold">{latest.status}</span>
                </p>
              </div>

              <Link
                href={`/admin/orders/${latest._id}`}
                className="mt-4 inline-block bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold"
              >
                View Order →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
