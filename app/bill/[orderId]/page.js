"use client";

import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { formatDateTime } from "@/lib/formatDate";

export default function BillPage({ params }) {
  const { orderId } = params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [paymentMode, setPaymentMode] = useState(null);
  const [modeLocked, setModeLocked] = useState(false); // payment method locked after selection / after UPI paid


  console.log(order)
  // ================= POPUP MODAL =================
  function ConfirmModal({ show, message, onYes, onNo }) {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-xl p-6 shadow-xl w-80 text-center animate-fadeIn">
          <p className="font-semibold text-gray-800">{message}</p>

          <div className="flex gap-3 mt-5">
            <button
              onClick={onNo}
              className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium"
            >
              No
            </button>

            <button
              onClick={onYes}
              className="flex-1 py-2 rounded-lg bg-green-600 text-white font-medium"
            >
              Yes
            </button>
          </div>
        </div>

        <style jsx>{`
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    );
  }

  const [confirmPopup, setConfirmPopup] = useState({
    show: false,
    message: "",
    onYes: null,
    onNo: null,
  });

  // ============= LOAD ORDER =============
  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
        const data = await res.json();

        setOrder(data.order);

        // If cancelled → unlock
        if (data.order.paymentStatus === "cancelled") {
          setPaymentMode(null);
          setModeLocked(false);
        }

        // If paymentMethod exists
        else if (data.order.paymentMethod) {
          setPaymentMode(data.order.paymentMethod);

          // UPI paid → lock both buttons
          if (data.order.paymentStatus === "pending" || data.order.paymentStatus === "paid") {
            setModeLocked(true);
          }
        }

      } catch (err) {
        console.log("Bill fetch error:", err);
      }
      setLoading(false);
    }
    loadOrder();
  }, [orderId]);

  if (loading)
    return <div className="p-10 text-center text-gray-300 text-xl">Loading bill...</div>;

  if (!order)
    return <div className="p-10 text-center text-gray-300 text-xl">Order not found ❌</div>;

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );
  const finalTotal = order.finalPrice ?? subtotal;
  const paymentStatus = order.paymentStatus || "unpaid";

  // UPI QR
  function makeUPI(amount) {
    return `upi://pay?pa=onzaman786-1@okaxis&pn=OneBite&am=${amount}&cu=INR`;
  }

  // ============= PAYMENT MODE CHANGE =============
  async function chooseMode(newMode) {
    // UPI → do NOT pending here
    const doAction = async () => {
      setPaymentMode(newMode);

      // If UPI selected → DO NOT LOCK until paid
      if (newMode === "cash") setModeLocked(true);

      await fetch(`/api/orders/${orderId}/payment-mode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      });

      if (newMode === "cash") {
        // Cash = pending immediately
        await fetch(`/api/orders/${orderId}/mark-pending`, { method: "POST" });

        setOrder((prev) => ({ ...prev, paymentStatus: "pending" }));
      }
    };

    if (modeLocked) {
      setConfirmPopup({
        show: true,
        message: "Change payment method? This will clear previous progress.",
        onYes: () => {
          setConfirmPopup({ show: false });
          doAction();
        },
        onNo: () => setConfirmPopup({ show: false }),
      });
      return;
    }

    await doAction();
  }

  // ============= USER PAID (UPI) =============
  async function userPaid() {
    setConfirmPopup({
      show: true,
      message: "Are you sure you have paid the bill?",
      onYes: async () => {
        setConfirmPopup({ show: false });

        // Mark pending
        await fetch(`/api/orders/${orderId}/mark-pending`, { method: "POST" });

        // Lock payment method permanently
        setModeLocked(true);

        // frontend sync
        setOrder((prev) => ({ ...prev, paymentStatus: "pending" }));

        alert("Payment submitted — kitchen is verifying ✔");
      },
      onNo: () => setConfirmPopup({ show: false }),
    });
  }

  // ============= DOWNLOAD BILL IMAGE =============
  async function downloadBillImage() {
    const bill = document.getElementById("bill-area");
    if (!bill) return;

    const canvas = await html2canvas(bill, {
      scale: 3,
      useCORS: true,
      logging: false,
    });

    const img = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = img;
    link.download = `Bill-${orderId}.png`;
    link.click();
  }

  // ============= STATUS BADGE =============
  function StatusBadge() {
    if (paymentStatus === "cancelled")
      return (
        <span className="px-3 py-1 bg-red-300 text-red-700 rounded-full text-xs">
          CANCELLED
        </span>
      );

    if (paymentStatus === "paid")
      return (
        <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs">
          PAID
        </span>
      );

    if (paymentStatus === "pending")
      return (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-xs">
            PENDING
          </span>
          <span className="text-[10px] text-gray-500">Checking in kitchen…</span>
        </div>
      );

    return (
      <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs">
        UNPAID
      </span>
    );
  }

  // ================= UI =================
  return (
    <>
      <ConfirmModal {...confirmPopup} />

      <div className="min-h-screen bg-gray-100 p-8 text-black">
        <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-8" id="bill-area">

          {/* HEADER */}
          <div className="text-center border-b pb-4">
            <img src="/onebite.jpeg" className="mx-auto h-20 w-20 rounded-full shadow-md object-cover" />
            <h1 className="text-2xl font-extrabold mt-3">BILL RECEIPT</h1>
            <p className="text-gray-600 mt-1">Sanjauli, Shimla, Himachal Pradesh</p>
            <p className="text-gray-600">India</p>
            <p className="mt-2 text-sm font-semibold">
              Contact: <span className="font-bold">7812050001</span>
            </p>
            <p className="text-sm mt-3">
              <b>Date:</b> {formatDateTime(order.createdAt)}
            </p>
          </div>

          {/* META */}
          <div className="mt-4 text-sm space-y-1">
            <p><b>Order ID:</b> {order._id}</p>
            <p><b>Table:</b> {order.tableName}</p>
            <p><b>KOT No:</b> {order.kotId || "N/A"}</p>
            <p><b>Status:</b> <StatusBadge /></p>
            <p><b>Customer:</b> {order.customerName}</p>
            <p><b>Phone:</b> {order.customerPhone}</p>
          </div>

          {/* ITEMS */}
          <div className="border-t border-b py-4 my-5">
            {order.items.map((item) => (
              <div key={item._id} className="flex justify-between py-2 text-sm font-medium">
                <span>{item.name} <span className="text-gray-500">(x{item.qty})</span></span>
                <span>₹{item.qty * item.price}</span>
              </div>
            ))}
          </div>

          {/* TOTALS */}
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Coupon Applied ({order.couponCode})</span>
                <span>-₹{order.discount}</span>
              </div>
            )}

            <div className="flex justify-between text-xl font-bold mt-3 border-t pt-3">
              <span>Total</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>

          {/* PAYMENT UI */}
          {paymentStatus !== "paid" && paymentStatus !== "cancelled" && (
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-3">Choose Payment Method</h2>

              <div className="flex gap-3">
                <button
                  onClick={() => chooseMode("upi")}
                  disabled={modeLocked && paymentMode !== "upi"}
                  className={`flex-1 py-2 rounded-lg font-semibold ${
                    paymentMode === "upi"
                      ? "bg-green-600 text-white"
                      : modeLocked && paymentMode !== "upi"
                        ? "bg-gray-300 text-gray-500"
                        : "bg-gray-200 text-black"
                  }`}
                >
                  Pay via UPI
                </button>

                <button
                  onClick={() => chooseMode("cash")}
                  disabled={modeLocked} // lock cash after UPI paid
                  className={`flex-1 py-2 rounded-lg font-semibold ${
                    paymentMode === "cash"
                      ? "bg-yellow-500 text-black"
                      : modeLocked
                        ? "bg-gray-300 text-gray-500"
                        : "bg-gray-200 text-black"
                  }`}
                >
                  Cash
                </button>
              </div>

              {/* CASH */}
              {paymentMode === "cash" && (
                <div className="mt-5 bg-yellow-100 p-4 rounded-lg border border-yellow-400">
                  <p className="font-bold text-yellow-800">Cash Payment Selected</p>
                  <p className="text-sm mt-1">Give ₹{finalTotal} to the staff.</p>
                </div>
              )}

              {/* UPI */}
              {paymentMode === "upi" && (
                <div className="mt-5 text-center">
                  <h3 className="font-bold">Pay via UPI</h3>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      makeUPI(finalTotal)
                    )}`}
                    className="mx-auto border rounded-lg shadow mt-3"
                  />

                  <button
                    onClick={userPaid}
                    disabled={modeLocked}
                    className={`mt-4 w-full py-2 rounded-lg font-semibold ${
                      modeLocked
                        ? "bg-gray-300 text-gray-500"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    I Have Paid
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PAID UI */}
          {paymentStatus === "paid" && (
            <div className="mt-8 bg-green-100 border border-green-400 p-4 rounded-lg text-center">
              <p className="font-bold text-green-700">
                Payment Successful ({order.paymentMethod?.toUpperCase()})
              </p>
            </div>
          )}

          {/* CANCELLED UI */}
          {paymentStatus === "cancelled" && (
            <div className="mt-8 bg-red-100 border border-red-400 p-4 rounded-lg text-center">
              <p className="font-bold text-red-700">
                Payment Cancelled — Please choose method again
              </p>
            </div>
          )}

          <p className="text-center text-xs text-gray-500 mt-8 border-t pt-4">
            Thank you for dining with us ❤️  
            <br />
            <span className="text-[11px] opacity-70">Powered by Aman Digital Solutions</span>
          </p>
        </div>

        <div className="flex gap-3 max-w-lg mx-auto mt-6">
          <button onClick={() => window.print()} className="flex-1 bg-black text-white py-3 rounded-lg">
            Print Bill
          </button>

          <button onClick={downloadBillImage} className="flex-1 bg-blue-600 text-white py-3 rounded-lg">
            Download Bill
          </button>
        </div>
      </div>
    </>
  );
}
