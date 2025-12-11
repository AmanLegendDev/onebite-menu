"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Calendar, Phone, ArrowRight, Ticket, Search } from "lucide-react";

export default function AdminCustomersPage() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  async function loadUsers() {
    const res = await fetch("/api/customer-users", { cache: "no-store" });
    const data = await res.json();

    if (data.success) {
      setUsers(data.users);
      setFiltered(data.users);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // FILTER FUNCTION
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setFiltered(users);
      return;
    }

    setFiltered(
      users.filter((u) => u.phone.toString().includes(q))
    );
  }, [query, users]);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-400">Loading customers...</div>
    );

  return (
    <div className="p-6 sm:p-8 text-white max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold">Customer Directory</h1>
          <p className="text-gray-400 text-sm mt-1">
            Complete list of all registered customers
          </p>
        </div>

        <Link
          href="/admin"
          className="px-4 py-2 rounded-lg bg-[#111] border border-[#222] hover:border-yellow-400 transition"
        >
          ← Back
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="mb-8 flex items-center gap-3 bg-[#111] border border-[#222] px-4 py-3 rounded-xl">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Search by phone number..."
          className="bg-transparent outline-none text-white flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((u) => (
          <div
            key={u._id}
            className="bg-[#0d0d0d] border border-[#222] hover:border-yellow-500
              rounded-2xl p-6 shadow-lg transition group relative"
          >
            {/* TOP ROW */}
            <div className="flex items-center gap-3">
              <div className="bg-[#222] p-3 rounded-xl group-hover:bg-yellow-400 group-hover:text-black transition">
                <User size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold">{u.name}</h2>
                <p className="text-sm text-gray-400">Registered Customer</p>
              </div>
            </div>

            {/* DETAILS */}
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-gray-300 flex items-center gap-2">
                <Phone size={14} className="text-yellow-400" /> {u.phone}
              </p>

              <p className="text-gray-300 flex items-center gap-2">
                <Calendar size={14} className="text-yellow-400" />
                Joined: {new Date(u.joinDate).toLocaleDateString()}
              </p>

              <p className="text-gray-300">
                Total KOTs:{" "}
                <span className="font-bold text-yellow-400">{u.totalKOT}</span>
              </p>

              <p className="text-xs text-gray-500">
                Last Order:{" "}
                {u.lastOrderDate
                  ? new Date(u.lastOrderDate).toLocaleString()
                  : "No orders yet"}
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-5 flex gap-3">
              <Link
                href={`/admin/customers/${u.phone}/orders`}
                className="flex-1 bg-yellow-500 text-black px-3 py-2 rounded-lg 
                text-center font-semibold text-sm flex items-center justify-center gap-1
                hover:bg-yellow-400 transition"
              >
                View Orders <ArrowRight size={15} />
              </Link>

              <Link
                href={`/admin/customers/${u.phone}/coupon`}
                className="flex-1 bg-blue-600 px-3 py-2 rounded-lg text-center 
                font-semibold text-sm flex items-center justify-center gap-1 hover:bg-blue-500 transition"
              >
                <Ticket size={14} /> Coupon
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="h-8" />
    </div>
  );
}
