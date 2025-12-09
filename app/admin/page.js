"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Utensils,
  ShoppingBag,
  ChevronRight,
  Users,
  Star,
} from "lucide-react";

export default function AdminDashboard() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  // ⭐ GLOBAL RATING
  const [rating, setRating] = useState({ average: 0, total: 0 });

  async function loadRating() {
    try {
      const res = await fetch("/api/rating/average", { cache: "no-store" });
      const data = await res.json();
      setRating(data);
    } catch (err) {
      console.log("Rating fetch error:", err);
    }
  }

  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  }

  async function loadItems() {
    const res = await fetch("/api/items?count=true");
    const data = await res.json();
    setItems(new Array(data.count));
  }

  async function loadOrders() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.orders || []);
  }

  async function loadUsers() {
    const res = await fetch("/api/customer-users", { cache: "no-store" });
    const data = await res.json();
    setUsers(data.users || []);
  }

  useEffect(() => {
    loadCategories();
    loadItems();
    loadOrders();
    loadUsers();
    loadRating(); // ⭐ LOAD rating at startup
  }, []);

  // 🔥 CARD COMPONENT
  function Card({ title, count, icon: Icon, href, color }) {
    return (
      <Link href={href}>
        <div
          className={`p-6 rounded-xl border border-[#222] bg-gradient-to-br ${color}
            shadow-[0_0_20px_rgba(0,0,0,0.5)]
            hover:shadow-[0_0_30px_rgba(255,199,0,0.4)]
            transition transform hover:-translate-y-1 cursor-pointer`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold opacity-90">{title}</h2>
            <Icon size={26} className="opacity-90" />
          </div>

          <p className="text-5xl font-extrabold mt-3 drop-shadow-[0_0_10px_rgba(255,200,0,0.6)]">
            {count}
          </p>

          <div className="flex items-center gap-1 text-sm text-gray-300 mt-3">
            <span>View details</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="pt-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white tracking-wide">
          Welcome, Admin 🔥
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Track restaurant performance, manage items & view live activity.
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">

        {/* ⭐ GLOBAL RATING FIRST CARD */}
        <Link href="/admin/ratings">
          <div
            className="p-6 rounded-xl border border-[#333] bg-gradient-to-br from-[#272727] to-[#1a1a1a]
              shadow-[0_0_25px_rgba(255,199,0,0.25)]
              hover:shadow-[0_0_35px_rgba(255,199,0,0.45)]
              transition transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold opacity-90">OneBite Rating</h2>
              <Star size={26} className="text-yellow-300" />
            </div>

            <p className="text-5xl font-extrabold mt-3 text-yellow-300 drop-shadow-[0_0_12px_rgba(255,200,0,0.8)]">
              {rating.average.toFixed(1)}★
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {rating.total} total reviews
            </p>

            <div className="flex items-center gap-1 text-sm text-gray-300 mt-3">
              <span>View details</span>
              <ChevronRight size={16} />
            </div>
          </div>
        </Link>

        {/* REMAINING CARDS */}
        <Card
          title="Categories"
          count={categories.length}
          icon={Layers}
          href="/admin/categories"
          color="from-[#141414] to-[#1b1b1b]"
        />

        <Card
          title="Menu Items"
          count={items.length}
          icon={Utensils}
          href="/admin/items"
          color="from-[#151515] to-[#1d1d1d]"
        />

        <Card
          title="Orders"
          count={orders.length}
          icon={ShoppingBag}
          href="/admin/orders"
          color="from-[#1a1a1a] to-[#232323]"
        />

        <Card
          title="Customers"
          count={users.length}
          icon={Users}
          href="/admin/customers"
          color="from-[#181818] to-[#222]"
        />

        <Card
          title="Payments"
          count={users.length}
          icon={Users}
          href="/admin/payments"
          color="from-[#181818] to-[#222]"
        />

        <Card
          title="Analytics"
          count={users.length}
          icon={Users}
          href="/admin/analytics"
          color="from-[#181818] to-[#222]"
        />
      </div>

      {/* SHORTCUTS */}
      <div className="mt-14">
        <h3 className="text-lg font-semibold mb-4 text-gray-300">
          Quick Actions ⚡
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Link href="/admin/orders">
            <div className="p-5 bg-[#121212] border border-[#222] rounded-xl hover:bg-[#181818] transition">
              <p className="text-xl font-semibold">View Active Orders</p>
              <p className="text-sm text-gray-400 mt-1">Check all recent orders</p>
            </div>
          </Link>

          <Link href="/admin/items/new">
            <div className="p-5 bg-[#121212] border border-[#222] rounded-xl hover:bg-[#181818] transition">
              <p className="text-xl font-semibold">Add New Item</p>
              <p className="text-sm text-gray-400 mt-1">Create a menu item</p>
            </div>
          </Link>

          <Link href="/admin/orders-by-table">
            <div className="p-5 bg-[#121212] border border-[#222] rounded-xl hover:bg-[#181818] transition">
              <p className="text-xl font-semibold">Orders by Table</p>
              <p className="text-sm text-gray-400 mt-1">Track per-table orders</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}