"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

import {
  LayoutDashboard,
  List,
  PlusSquare,
  LayoutGrid,
  Users,
  BarChart3,
  Star,
  Bell,
  Menu,
  X,
  LogOut,
  HomeIcon,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ------------------------------------------
  // 🔔 FULLY FIXED NOTIFICATION SYSTEM
  // ------------------------------------------
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!session) return;

    checkLatestOrder();

    const interval = setInterval(checkLatestOrder, 2000);
    return () => clearInterval(interval);
  }, [session]);

  async function checkLatestOrder() {
    try {
      const res = await fetch("/api/orders?latest=true", {
        cache: "no-store",
      });

      const data = await res.json();
      const newest = data?.orders?.[0];
      if (!newest) return;

      const orderTime = new Date(newest.createdAt).getTime();

      // 🔥 Load saved time from localStorage
      let savedTime = localStorage.getItem("lastOrderTime");
      savedTime = savedTime ? Number(savedTime) : null;

      // FIRST RUN → JUST SAVE, DO NOT RING
      if (!savedTime) {
        localStorage.setItem("lastOrderTime", orderTime);
        return;
      }

      // 🔥 REAL NEW ORDER DETECTED
      if (orderTime > savedTime) {
        console.log("🔥 NEW ORDER DETECTED — FIXED VERSION");

        new Audio("/notify.mp3").play().catch(() => {});

        setToast({
          table: newest.tableName || newest.table,
          qty: newest.totalQty,
        });

        setTimeout(() => setToast(null), 3000);

        // Save new timestamp
        localStorage.setItem("lastOrderTime", orderTime);
      }
    } catch (err) {
      console.log("CHECK ERROR:", err);
    }
  }

  // ------------------------------------------
  // ADMIN PROTECTION
  // ------------------------------------------
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/login");
    }
  }, [session, status]);

  if (status === "loading") return null;
  if (!session || session.user.role !== "admin") return null;

  // ------------------------------------------
  // NAV LINKS (Orders removed)
  // ------------------------------------------
  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Menu Items", href: "/admin/items", icon: PlusSquare },
    { name: "Categories", href: "/admin/categories", icon: List },
    { name: "Tables", href: "/admin/orders-by-table", icon: LayoutGrid },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Ratings", href: "/admin/ratings", icon: Star },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Home", href: "/", icon: HomeIcon },
  ];

  const activeClass =
    "flex items-center gap-3 px-3 py-2 rounded-lg bg-[#18181b] text-white font-semibold border border-[#ff6a3d] shadow-[0_0_15px_rgba(255,106,61,0.18)]";

  const inactiveClass =
    "flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-[#18181b] hover:text-white transition";

  const currentTitle =
    links.find((l) => pathname.startsWith(l.href))?.name || "Admin Panel";

  return (
    <div className="bg-[#050505] text-white flex min-h-screen">
      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-black border-r border-[#232323] px-5 py-6 flex flex-col z-40 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-72"} md:translate-x-0`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-white mb-4"
        >
          <X size={26} />
        </button>

        {/* LOGO */}
        <div className="flex items-center gap-3 mb-8">
          <Image
            src="/onebite-2.jpg"
            alt="OneBite"
            width={48}
            height={48}
            className="rounded-full border border-yellow-500"
          />
          <div>
            <p className="text-sm uppercase tracking-widest text-yellow-400/90">
              ONEBITE
            </p>
            <p className="text-xs text-gray-400 -mt-1">Admin Panel</p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
          {links.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={isActive ? activeClass : inactiveClass}
              >
                <Icon size={18} />
                <span className="text-sm">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-4 flex items-center gap-3 px-3 py-2 rounded-lg bg-[#18181b]/60 text-gray-300 hover:bg-red-600/30 hover:text-white border border-[#27272a]"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 min-h-screen md:ml-64">
        <header className="h-16 bg-[#050505]/90 border-b border-[#1f1f1f] flex items-center justify-between px-4 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-200"
          >
            <Menu size={26} />
          </button>

          <h2 className="text-lg font-semibold">{currentTitle}</h2>
          <Bell size={22} className="text-gray-300" />
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed top-6 right-6 bg-[#111] border border-yellow-500 text-white px-5 py-3 rounded-xl shadow-lg z-[9999] animate-slide-up">
          <p className="font-semibold text-yellow-400">New Order!</p>
          <p className="text-sm">
            Table {toast.table} • {toast.qty} items
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
