"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  Utensils,
  ShoppingBag,
  Users,
  Star,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  Wallet,
  LayoutGrid
} from "lucide-react";

export default function AdminDashboard() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [rating, setRating] = useState({ average: 0, total: 0 });

  // 🔥 LIVE DASHBOARD POLLING
useEffect(() => {
  const interval = setInterval(() => {
    loadOrders();
    loadUsers();
    loadItems();
    loadCategories();
    loadRating();
  }, 2000);

  return () => clearInterval(interval);
}, []);


  // ⭐ LOADERS (no backend change)
  async function loadRating() {
    try {
      const res = await fetch("/api/rating/average", { cache: "no-store" });
      const data = await res.json();
      setRating(data);
    } catch (err) { }
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
    loadRating();
  }, []);

  // ⭐ Card Component
  function Card({ title, count, icon: Icon, href }) {
    return (
      <Link href={href}>
        <div className="p-6 bg-[#111] rounded-xl border border-[#222] hover:border-yellow-400 transition shadow-md hover:shadow-yellow-500/10 cursor-pointer">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-300">{title}</h2>
            <Icon size={24} className="text-gray-400" />
          </div>

          <p className="text-4xl font-bold text-white mt-3">{count}</p>

          <div className="text-yellow-400 text-xs mt-2 flex items-center gap-1">
            View →
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="pt-4">
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm">
          Restaurant performance overview & management panel.
        </p>
      </div>

      {/* ⭐ ROW 1: BUSINESS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        {/* ⭐ Rating */}
        <Link href="/admin/ratings">
          <div className="p-6 bg-gradient-to-br from-[#242424] to-[#111] rounded-xl border border-[#333] hover:border-yellow-400 shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-300">OneBite Rating</span>
              <Star size={24} className="text-yellow-300" />
            </div>

            <p className="text-5xl font-extrabold text-yellow-300 mt-3">
              {rating.average.toFixed(1)}★
            </p>

            <p className="text-xs text-gray-400">{rating.total} reviews</p>

            <div className="text-yellow-400 text-xs mt-3 flex items-center gap-1">
              View →
            </div>
          </div>
        </Link>

        <Card
          title="Total Orders"
          count={orders.filter(o =>
  o.status === "served" && o.paymentStatus === "paid"
).length}

          icon={ShoppingBag}
          href="/admin/orders/history"
        />

        <Card
          title="Menu Items"
          count={items.length}
          icon={Utensils}
          href="/admin/items"
        />

        <Card
          title="Customers"
          count={users.length}
          icon={Users}
          href="/admin/customers"
        />
      </div>

      {/* ⭐ ROW 2: ORDER WORKFLOW */}
      <h3 className="text-lg font-semibold text-gray-300 mb-3">Order Workflow</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        <Card
          title="Pending Orders"
          count={orders.filter(o => o.status === "pending").length}
          icon={ClipboardList}
          href="/admin/orders/pending"
        />

        <Card
          title="Preparing"
          count={orders.filter(o => o.status === "preparing").length}
          icon={Utensils}
          href="/admin/orders/preparing"
        />

        <Card
          title="Ready to Serve"
          count={orders.filter(o => o.status === "ready").length}
          icon={Layers}
          href="/admin/orders/ready"
        />

        <Card
          title="Completed Orders"
          count={orders.filter(o => 
  o.status === "served" && o.paymentStatus === "paid"
).length}

          icon={TrendingUp}
          href="/admin/orders/completed"
        />
      </div>

      {/* ⭐ ROW 3: PAYMENTS */}
      <h3 className="text-lg font-semibold text-gray-300 mb-3">Payments</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">

        <Card
          title="Pending Payments"
          count={orders.filter(o => o.paymentStatus === "pending").length}
          icon={AlertTriangle}
          href="/admin/payments"
        />

        <Card
          title="Completed Payments"
          count={orders.filter(o => o.paymentStatus === "paid").length}
          icon={Wallet}
          href="/admin/payments/completed"
        />

        <Card
          title="Payment Analytics"
          count={users.length}
          icon={TrendingUp}
          href="/admin/analytics"
        />
      </div>

      {/* ⭐ ROW 4: MANAGEMENT */}
      <h3 className="text-lg font-semibold text-gray-300 mb-3">Management</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card
          title="Categories"
          count={categories.length}
          icon={Layers}
          href="/admin/categories"
        />

        <Card
          title="Tables & QR"
          count={12}
          icon={LayoutGrid}
          href="/admin/orders-by-table"
        />

        <Card
          title="Add Items"
          count={0}
          icon={Star}
          href="/admin/items"
        />
      </div>

      {/* ⭐ QUICK ACTIONS */}
      <div className="mt-14">
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Quick Actions</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

          <Link href="/admin/orders/pending">
            <div className="p-5 bg-[#111] border border-[#222] rounded-xl hover:border-yellow-400 transition">
              <p className="text-xl font-semibold">View Active Orders</p>
              <p className="text-gray-400 text-sm">Check all ongoing orders</p>
            </div>
          </Link>

          <Link href="/admin/items/new">
            <div className="p-5 bg-[#111] border border-[#222] rounded-xl hover:border-yellow-400 transition">
              <p className="text-xl font-semibold">Add Menu Item</p>
              <p className="text-gray-400 text-sm">Create a new dish</p>
            </div>
          </Link>

          <Link href="/admin/analytics">
            <div className="p-5 bg-[#111] border border-[#222] rounded-xl hover:border-yellow-400 transition">
              <p className="text-xl font-semibold">View Analytics</p>
              <p className="text-gray-400 text-sm">Check weekly performance</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
