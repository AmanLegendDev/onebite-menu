"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // POPUP STATE
  const [popup, setPopup] = useState({
    show: false,
    orderId: null,
  });

  async function loadPayments() {
    const res = await fetch("/api/orders/pending", { cache: "no-store" });
    const data = await res.json();

    if (data.success) {
      setOrders(data.orders);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPayments();

    // auto refresh
    const interval = setInterval(loadPayments, 7000);
    return () => clearInterval(interval);
  }, []);

  async function markPaid(id) {
    await fetch(`/api/orders/${id}/mark-paid`, { method: "POST" });
    loadPayments();
  }

  // Cancel → Popup open
  function openCancelPopup(id) {
    setPopup({ show: true, orderId: id });
  }

  // Cancel → Confirm YES
  async function confirmCancel() {
    if (!popup.orderId) return;

    await fetch(`/api/orders/${popup.orderId}/cancel-payment`, {
      method: "POST",
    });

    setPopup({ show: false, orderId: null });
    loadPayments();
  }

  // Cancel → NO
  function closePopup() {
    setPopup({ show: false, orderId: null });
  }

  if (loading)
    return (
      <div className="p-10 text-center text-gray-400 text-xl">
        Loading payments...
      </div>
    );

  return (
    <div className="p-6 text-white">
      <h1 className="text-4xl font-extrabold mb-4">Payment Verification</h1>
      <p className="text-gray-400 mb-6">Review & confirm customer payments</p>

      {orders.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          No pending payments 🎉
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {orders.map((o) => (
          <div
            key={o._id}
            className="bg-[#111] border border-[#222] p-5 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">₹{o.finalPrice}</h2>

              {o.paymentStatus === "pending" ? (
                <Clock className="text-yellow-400" />
              ) : (
                <Clock className="text-red-400" />
              )}
            </div>

            <p className="text-gray-300 text-sm">
              <b>Customer:</b> {o.customerName}
            </p>
            <p className="text-gray-300 text-sm">
              <b>Phone:</b> {o.customerPhone}
            </p>
            <p className="text-gray-300 text-sm">
              <b>Table:</b> {o.tableName}
            </p>

            <p className="text-gray-300 text-sm mt-1">
              <b>Method:</b>{" "}
              <span className="uppercase text-yellow-400">
                {o.paymentMethod || "Not Selected"}
              </span>
            </p>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => markPaid(o._id)}
                className="flex-1 bg-green-600 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold"
              >
                <CheckCircle size={18} /> Mark Paid
              </button>

              <button
                onClick={() => openCancelPopup(o._id)}
                className="flex-1 bg-red-600 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold"
              >
                <XCircle size={18} /> Cancel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* POPUP UI */}
      {popup.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-xl w-80 text-center">
            <h2 className="text-lg font-bold mb-2 text-red-400">
              Payment Not Received?
            </h2>

            <p className="text-gray-300 text-sm">
              Do you want to cancel this payment request?
            </p>

            <div className="flex gap-3 mt-5">
              <button
                onClick={closePopup}
                className="flex-1 py-2 bg-gray-600 rounded-lg font-semibold"
              >
                No
              </button>

              <button
                onClick={confirmCancel}
                className="flex-1 py-2 bg-red-600 rounded-lg font-semibold"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
