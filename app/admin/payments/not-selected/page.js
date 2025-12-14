"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Timer, FileText } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/formatDate";

export default function PaymentNotSelectedPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();

      // 🔴 ONLY NOT SELECTED PAYMENTS
      const notSelected = (data.orders || []).filter(
        o =>
          o.paymentStatus === "unpaid" &&
          (!o.paymentMethod || o.paymentMethod === "")
      );

      setOrders(notSelected);
    } catch (err) {
      console.log("Not selected load error:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
    const i = setInterval(loadOrders, 3000);
    return () => clearInterval(i);
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-400">
        Loading payment warnings…
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-extrabold mb-2 text-red-400 flex items-center gap-2">
        <AlertTriangle /> Payment Not Selected
      </h1>

      <p className="text-red-300 mb-6 text-sm">
        ⚠ These customers placed orders but did NOT select any payment method.
      </p>

      <Link
        href="/admin"
        className="inline-block mb-6 px-4 py-2 rounded-lg bg-[#111] border border-[#222]"
      >
        ← Back
      </Link>

      {orders.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          All good 🎉 No missing payments.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map(o => (
          <div
            key={o._id}
            className="bg-[#160000] border border-red-700 p-5 rounded-xl shadow"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-red-400 font-bold">₹{o.totalPrice}</p>
              <AlertTriangle className="text-red-500" />
            </div>

            <p className="text-gray-200 text-sm">
              <b>Table:</b> {o.tableName || o.table}
            </p>

            <p className="text-gray-200 text-sm">
              <b>Customer:</b> {o.customerName || "Unknown"}
            </p>

            <p className="text-gray-200 text-sm">
              <b>Phone:</b> {o.customerPhone || "-"}
            </p>

            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Timer size={12} />
              {formatDateTime(o.createdAt)}
            </p>

            <div className="mt-3 text-xs font-semibold text-red-300">
              ⚠ Payment method NOT selected
            </div>

            <Link
              href={`/admin/orders/bill/${o._id}`}
              className="mt-4 flex items-center justify-center gap-2 text-sm bg-[#222] py-2 rounded-lg hover:bg-[#333]"
            >
              <FileText size={16} /> Open Bill
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
