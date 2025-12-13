"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import Link from "next/link";

export default function PendingPaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [popup, setPopup] = useState({
    show: false,
    orderId: null,
  });

  async function loadPending() {
    try {
      const res = await fetch("/api/orders?payment=pending", {
        cache: "no-store",
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      console.log("Pending payment error:", e);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPending();
    const int = setInterval(loadPending, 4000);
    return () => clearInterval(int);
  }, []);

  // ✅ MARK PAID
  async function markPaid(id) {
    try {
      const res = await fetch(`/api/orders/${id}/mark-paid`, {
        method: "POST",
      });

      if (!res.ok) {
        alert("Payment update failed");
        return;
      }

      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.log("Mark Paid Error:", err);
    }
  }

  function openCancel(id) {
    setPopup({ show: true, orderId: id });
  }

  async function confirmCancel() {
    await fetch(`/api/orders/${popup.orderId}/cancel-payment`, {
      method: "POST",
    });

    setPopup({ show: false, orderId: null });
    loadPending();
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-400">
        Loading payments…
      </div>
    );
  }

  // 🔥 SPLIT LOGIC (NO BACKEND CHANGE)
  const methodSelected = orders.filter(
    (o) => o.paymentMethod && o.paymentMethod !== ""
  );

  const methodNotSelected = orders.filter(
    (o) => !o.paymentMethod || o.paymentMethod === ""
  );

  function PaymentCard(o) {
    return (
      <div
        key={o._id}
        className="bg-[#111] border border-[#222] p-5 rounded-xl shadow"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">₹{o.finalPrice}</h2>
          <Clock className="text-yellow-400" />
        </div>

        <p className="text-gray-300 text-sm">
          <b>Customer:</b> {o.customerName || "Unknown"}
        </p>
        <p className="text-gray-300 text-sm">
          <b>Phone:</b> {o.customerPhone || "-"}
        </p>
        <p className="text-gray-300 text-sm">
          <b>Table:</b> {o.tableName}
        </p>

        <p className="text-gray-300 text-sm mt-1">
          <b>Method:</b>{" "}
          <span className="text-yellow-400 uppercase">
            {o.paymentMethod || "NOT SELECTED"}
          </span>
        </p>

        <p className="text-xs text-gray-500 mt-1">
          KOT: {o.kotId || "N/A"}
        </p>

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => markPaid(o._id)}
            className="flex-1 bg-green-600 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold"
          >
            <CheckCircle size={18} /> Paid
          </button>

          <button
            onClick={() => openCancel(o._id)}
            className="flex-1 bg-red-600 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold"
          >
            <XCircle size={18} /> Cancel
          </button>
        </div>

        <Link
          href={`/admin/orders/bill/${o._id}`}
          className="mt-3 flex items-center justify-center gap-2 text-sm bg-[#222] py-2 rounded-lg"
        >
          <FileText size={16} /> View Bill
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-extrabold mb-2">Pending Payments</h1>
      <p className="text-gray-400 mb-4">Verify customer payments</p>

      <Link
        href="/admin"
        className="inline-block mb-6 px-4 py-2 rounded-lg bg-[#111] border border-[#222]"
      >
        ← Back
      </Link>

      {orders.length === 0 && (
        <p className="text-center text-gray-500 py-10">
          No pending payments 🎉
        </p>
      )}

      {/* 🔝 METHOD SELECTED */}
      {methodSelected.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-green-400 mb-3">
            Payment Method Selected
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            {methodSelected.map(PaymentCard)}
          </div>
        </>
      )}

      {/* 🔽 METHOD NOT SELECTED */}
      {methodNotSelected.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-red-400 mb-3">
            Payment Method NOT Selected
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {methodNotSelected.map(PaymentCard)}
          </div>
        </>
      )}

      {/* ❌ CANCEL POPUP */}
      {popup.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1c1c1c] p-6 rounded-xl border border-red-700 shadow-xl w-80 text-center">
            <h2 className="font-bold text-lg text-red-400 mb-2">
              Cancel Payment?
            </h2>

            <p className="text-gray-300 text-sm mb-4">
              Are you sure you want to cancel this payment?
            </p>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setPopup({ show: false, orderId: null })}
                className="flex-1 bg-gray-600 py-2 rounded-lg font-semibold"
              >
                No
              </button>

              <button
                onClick={confirmCancel}
                className="flex-1 bg-red-600 py-2 rounded-lg font-semibold"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
