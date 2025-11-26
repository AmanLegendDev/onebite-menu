"use client"
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]); // 👈 FIXED: orders added

  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  }

  async function loadItems() {
    const res = await fetch("/api/items");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  }

  async function loadOrders() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.orders || []); // 👈 FIXED
  }

  useEffect(() => {
    loadCategories();
    loadItems();
    loadOrders(); // 👈 FIXED
  }, []);

  return (
    <div>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-6">
          Welcome, Admin 👑
        </h1>

        <p className="text-gray-400 mb-10">
          Your Digital Menu System Dashboard
        </p>
      </div>

      {/* ------------------- DASHBOARD CARDS ------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* CARD 1 */}
        <Link href="/admin/categories">
          <div className="bg-[#111111] p-6 rounded-xl border border-[#1f1f1f] shadow hover:shadow-xl transition">
            <h2 className="text-lg font-semibold mb-2">Categories</h2>
            <p className="text-4xl font-bold">{categories.length}</p>
            <span className="text-gray-400 text-sm">Total categories</span>
          </div>
        </Link>

        {/* CARD 2 */}
        <Link href="/admin/items">
          <div className="bg-[#111111] p-6 rounded-xl border border-[#1f1f1f] shadow hover:shadow-xl transition">
            <h2 className="text-lg font-semibold mb-2">Menu Items</h2>
            <p className="text-4xl font-bold">{items.length}</p>
            <span className="text-gray-400 text-sm">Total menu items</span>
          </div>
        </Link>

        {/* CARD 3 — ORDERS */}
        <Link href="/admin/orders">
          <div className="bg-[#111] p-6 rounded-xl border border-gray-800 shadow hover:border-[#ff6a3d] transition cursor-pointer">
            <h2 className="text-xl font-semibold">Orders</h2>
            <p className="text-4xl font-bold mt-2">{orders.length}</p>
            <p className="text-gray-400 text-sm mt-1">Customer orders</p>
          </div>
        </Link>

      </div>
    </div>
  );
}
