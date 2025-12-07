"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Calendar, Phone, ArrowRight, Ticket } from "lucide-react";

export default function AdminCustomersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    const res = await fetch("/api/customer-users", { cache: "no-store" });
    const data = await res.json();

    if (data.success) {
      setUsers(data.users);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-400 p-10">Loading customers...</div>
    );

  return (
    <div className="p-6 text-white">
      <h1 className="text-4xl font-extrabold mb-2">Customers</h1>
      <p className="text-gray-400 mb-8">
        Complete list of all registered customers
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map((u) => (
          <div
            key={u._id}
            className="bg-[#111] border border-[#222] p-6 rounded-xl shadow-lg hover:border-[#ff6a3d] transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <User className="text-yellow-400" />
              <h2 className="text-xl font-bold">{u.name}</h2>
            </div>

            <p className="text-sm text-gray-400 flex items-center gap-2">
              <Phone size={14} /> {u.phone}
            </p>

            <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
              <Calendar size={14} />
              Joined: {new Date(u.joinDate).toLocaleDateString()}
            </p>

            <p className="text-sm mt-2">
              Total KOTs:{" "}
              <span className="font-bold text-yellow-400">{u.totalKOT}</span>
            </p>

            <p className="text-xs text-gray-500 mt-1">
              Last Order:{" "}
              {u.lastOrderDate
                ? new Date(u.lastOrderDate).toLocaleString()
                : "No orders yet"}
            </p>

            {/* ACTION BUTTONS */}
            <div className="mt-5 flex gap-2">
              <Link
                href={`/admin/customers/${u.phone}/orders`}
                className="flex-1 bg-[#ff6a3d] px-3 py-2 rounded-lg text-center font-semibold text-sm"
              >
                View Orders →
              </Link>

              <Link
                href={`/admin/customers/${u.phone}/coupon`}
                className="flex-1 bg-blue-600 px-3 py-2 rounded-lg text-center font-semibold text-sm flex items-center justify-center gap-1"
              >
                <Ticket size={14} /> Coupon
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
