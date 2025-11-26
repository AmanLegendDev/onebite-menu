"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  List,
  PlusSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === "loading") return null;

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="bg-[#0b0b0b] text-white flex">

      {/* ---------- MOBILE OVERLAY ---------- */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* ---------- SIDEBAR ---------- */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-[#0f0f0f] border-r border-[#1f1f1f] p-6 flex flex-col z-40
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-64"}
          md:translate-x-0
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-white mb-6 flex justify-end"
        >
          <X size={28} />
        </button>

        <h1 className="text-xl font-semibold mb-10">Digital Menu</h1>

        <div className="space-y-3 flex-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 p-2 rounded text-gray-300 hover:bg-[#1a1a1a] transition"
          >
            <LayoutDashboard size={20} /> Dashboard
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center gap-3 p-2 rounded text-gray-300 hover:bg-[#1a1a1a] transition"
          >
            <List size={20} /> Categories
          </Link>

          <Link
            href="/admin/items"
            className="flex items-center gap-3 p-2 rounded text-gray-300 hover:bg-[#1a1a1a] transition"
          >
            <PlusSquare size={20} /> Menu Items
          </Link>

          <Link
            href="/"
            className="flex items-center gap-3 p-2 rounded text-gray-300 hover:bg-[#1a1a1a] transition"
          >
            <PlusSquare size={20} /> Home
          </Link>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 p-2 rounded hover:bg-red-600/20 text-gray-300 transition"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* ---------- MAIN CONTENT ---------- */}
      <div className="flex-1 min-h-screen md:ml-64">

        {/* TOPBAR */}
        <div className="h-16 bg-[#0f0f0f] border-b border-[#1e1e1e] flex items-center justify-between px-6">
          
          {/* Hamburger button (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-white"
          >
            <Menu size={30} />
          </button>

          <h2 className="text-lg font-semibold">Admin Panel</h2>

          <p className="text-gray-400 text-sm hidden sm:block">
            Logged in as {session.user.email}
          </p>
        </div>

        {/* PAGE CONTENT */}
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
}
