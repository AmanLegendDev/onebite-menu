"use client";
import { useEffect } from "react";
import { useState } from "react";
import { redirect, usePathname } from "next/navigation";
import AdminNotification from "@/app/component/AdminNotification";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard,
  List,
  PlusSquare,
  LogOut,
  Menu,
  X,
  HomeIcon,
  MenuIcon,
  ListOrdered
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation"; 


export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

 
useEffect(() => {
  if (status === "loading") return;

  if (!session || session.user.role !== "admin") {
    router.replace("/login"); 
  }
}, [session, status]);

if (status === "loading") return null;

if (!session || session.user.role !== "admin") {
  return null;
}


const activeStyle =
  "flex items-center gap-3 p-2 rounded-lg bg-[#1a1a1a] text-white font-semibold border border-[#ff6a3d]";

const inactiveStyle =
  "flex items-center gap-3 p-2 rounded-lg text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition";




  // ⭐ FINAL SIDEBAR ROUTES
  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ListOrdered },
    { name: "Categories", href: "/admin/categories", icon: List },
    { name: "Menu Items", href: "/admin/items", icon: PlusSquare },
    { name: "Home", href: "/", icon: HomeIcon },
  ];

  return (
    <div className="bg-[#0b0b0b] text-white flex">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-[#0f0f0f] border-r border-[#1f1f1f] p-6 flex flex-col z-40
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-64"}
          md:translate-x-0
        `}
      >
        {/* Close Button - Mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden text-white mb-6 flex justify-end"
        >
          <X size={28} />
        </button>

        {/* LOGO */}
        <h1 className="text-xl font-bold mb-10 tracking-wide">
          Digital Menu Admin
        </h1>

        {/* LINKS */}
        <div className="space-y-2 flex-1">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 p-2 rounded-lg transition
                  ${isActive
                    ? "bg-[#1a1a1a] text-white font-semibold border border-[#ff6a3d]"
                    : "text-gray-300 hover:bg-[#1a1a1a] hover:text-white"
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <link.icon size={20} />
                {link.name}
              </Link>
              
            );
          })}

          <Link
  href="/admin/orders-by-table"
  className={pathname === "/admin/orders-by-table" ? activeStyle : inactiveStyle}
>
  Tables
</Link>

        </div>

        {/* LOGOUT */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-600/20 text-gray-300 hover:text-white transition"
        >
          <LogOut size={20} /> Logout
        </button>

        {/* EMAIL - Mobile */}
        <p className="text-gray-500 text-xs mt-4 block md:hidden">
          {session?.user?.email}
        </p>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-h-screen md:ml-64">

        {/* TOP NAV */}
        <div className="h-16 bg-[#0f0f0f]/80 backdrop-blur border-b border-[#1e1e1e]
          flex items-center justify-between px-6 sticky top-0 z-20 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-white"
          >
            <Menu size={30} />
          </button>

          <h2 className="text-lg font-semibold tracking-wide">Admin Panel</h2>

          {/* Email Desktop */}
          <p className="text-gray-400 text-sm hidden md:block">
            {session?.user?.email}
          </p>  
        </div>

        {/* PAGE CONTENT */}
       
<AdminNotification />
        <main className="p-5">{children}</main>
      </div>
    </div>
  );
}
