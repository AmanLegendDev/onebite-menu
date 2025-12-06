"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminNotification from "@/app/component/AdminNotification";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

import {
  LayoutDashboard,
  List,
  PlusSquare,
  LogOut,
  Menu,
  X,
  HomeIcon,
  ListOrdered,
  LayoutGrid,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ PROTECT ADMIN ROUTES
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") {
      router.replace("/login");
    }
  }, [session, status, router]);

  if (status === "loading") return null;
  if (!session || session.user.role !== "admin") return null;

  // 🔗 MAIN NAV LINKS
  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, group: "Overview" },
    { name: "Orders", href: "/admin/orders", icon: ListOrdered, group: "Overview" },

    { name: "Categories", href: "/admin/categories", icon: List, group: "Manage" },
    { name: "Menu Items", href: "/admin/items", icon: PlusSquare, group: "Manage" },
    {
      name: "Tables",
      href: "/admin/orders-by-table",
      icon: LayoutGrid,
      group: "Manage",
    },

    { name: "Home", href: "/", icon: HomeIcon, group: "Other" },
  ];

  const activeClass =
    "flex items-center gap-3 px-3 py-2 rounded-lg bg-[#18181b] text-white font-semibold border border-[#ff6a3d] shadow-[0_0_15px_rgba(255,106,61,0.35)]";
  const inactiveClass =
    "flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-[#18181b] hover:text-white transition";

  // sidebar groups
  const groups = ["Overview", "Manage", "Other"];

  // simple title
  const titleMap = {
    "/admin": "Dashboard",
    "/admin/orders": "Orders",
    "/admin/categories": "Categories",
    "/admin/items": "Menu Items",
    "/admin/orders-by-table": "Tables",
  };
  const currentTitle =
    Object.entries(titleMap).find(([key]) => pathname.startsWith(key))?.[1] ||
    "Admin Panel";

  return (
    <div className="bg-[#050505] text-white flex min-h-screen">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen w-68 max-w-[260px]
        bg-gradient-to-b from-[#050505] via-black to-[#050505]
        border-r border-[#232323] px-5 py-6 flex flex-col z-40
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-72"}
        md:translate-x-0`}
      >
        {/* Close Button (Mobile) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-white mb-4 flex justify-end"
        >
          <X size={26} />
        </button>

        {/* LOGO + BRAND */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-[#ffb100]/60 shadow-[0_0_18px_rgba(255,177,0,0.3)]">
            <Image
              src="/onebite-2.jpg"
              alt="OneBite"
              width={44}
              height={44}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[#ffb100]/80">
              ONEBITE
            </p>
            <p className="text-[13px] text-gray-400">
              Digital Menu • Admin
            </p>
          </div>
        </div>

        {/* STATUS PILL */}
        <div className="flex items-center justify-between mb-6 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
          <span className="text-[11px] text-gray-500">
            {session?.user?.email}
          </span>
        </div>

        {/* NAV GROUPS */}
        <div className="space-y-6 flex-1 overflow-y-auto pr-1">
          {groups.map((group) => (
            <div key={group}>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-gray-500 mb-2 uppercase">
                {group}
              </p>
              <div className="space-y-1">
                {links
                  .filter((l) => l.group === group)
                  .map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
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
              </div>
            </div>
          ))}
        </div>

        {/* LOGOUT */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-4 flex items-center justify-between gap-3 px-3 py-2 rounded-lg
          bg-[#18181b]/60 text-gray-300 hover:bg-red-600/20 hover:text-white border border-[#27272a] transition"
        >
          <div className="flex items-center gap-2">
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
            SECURE
          </span>
        </button>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 min-h-screen md:ml-[260px] bg-[#050505]">

        {/* TOP NAVBAR */}
        <header
          className="h-16 bg-[#050505]/90 backdrop-blur border-b border-[#1f1f1f]
          flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20
          shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
        >
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-100"
          >
            <Menu size={26} />
          </button>

          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block w-1 h-7 rounded-full bg-[#ffb100]" />
            <h2 className="text-[17px] sm:text-lg font-semibold tracking-wide">
              {currentTitle}
            </h2>
          </div>

          {/* Right side info */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400">
                Admin logged in
              </span>
              <span className="text-[13px] font-medium text-gray-200 max-w-[180px] truncate">
                {session?.user?.email}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ffb100] to-[#ff6a3d] text-black flex items-center justify-center text-xs font-bold">
              {session?.user?.name?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* NOTIFICATION BAR + PAGE CONTENT */}
        <AdminNotification />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
