"use client";

import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import { formatDateTime } from "@/lib/formatDate";

/**
 * Final BillPage — realtime + confirm popup + UPI app buttons + robust modeLock logic
 * - Polls /api/orders/:id every 2s for realtime updates
 * - chooseMode(newMode): shows confirm popup -> sets mode via /payment-mode, cash sets pending immediately
 * - userPaid(): shows confirm popup -> calls /mark-pending, locks mode
 * - GPay/PhonePe/Paytm buttons open the UPI deeplink (mobile will open app), desktop will copy UPI string
 */

export default function BillPage({ params }) {
  const { orderId } = params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [paymentMode, setPaymentMode] = useState(null);
  const [modeLocked, setModeLocked] = useState(false); // when true, changes require confirm and server state is locked in
  const [confirmPopup, setConfirmPopup] = useState({
    show: false,
    message: "",
    onYes: null,
    onNo: null,
  });

  const pollRef = useRef(null);

  // utility: build UPI deeplink
  function makeUPI(amount) {
    // use your UPI id here
    return `upi://pay?pa=onzaman786-1@okaxis&pn=OneBite&am=${amount}&cu=INR`;
  }

  // ================== load order once & set initial states ==================
  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
        const data = await res.json();
        if (!mounted) return;
        setOrder(data.order || null);

        // reflect server-provided payment method & lock logic
        if (data.order) {
          if (data.order.paymentStatus === "cancelled") {
            setPaymentMode(null);
            setModeLocked(false);
          } else {
            if (data.order.paymentMethod) {
              setPaymentMode(data.order.paymentMethod);
              if (data.order.paymentStatus === "pending" || data.order.paymentStatus === "paid") {
                setModeLocked(true);
              } else {
                // server has a method but not pending/paid: allow local selection (still show)
                // do NOT force lock
              }
            }
          }
        }
      } catch (err) {
        console.log("Bill fetch error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [orderId]);


 

useEffect(() => {
  const eventSource = new EventSource(`/api/orders/${orderId}/stream`);

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.order) {
      // ONLY UPDATE ORDER
      setOrder(data.order);

      // DO NOT TOUCH local paymentMode or modeLocked here
      // This was causing admin update to break
    }
  };

  eventSource.onerror = () => eventSource.close();

  return () => eventSource.close();
}, [orderId]);



  if (loading) return <div className="p-10 text-center text-gray-300 text-xl">Loading bill...</div>;
  if (!order) return <div className="p-10 text-center text-gray-300 text-xl">Order not found ❌</div>;

  const subtotal = order.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const finalTotal = order.finalPrice ?? subtotal;
  const paymentStatus = order.paymentStatus || "unpaid";

  // ================== Confirm Modal helper ==================
  function ConfirmModal({ show, message, onYes, onNo }) {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
        <div className="bg-white rounded-xl p-6 shadow-xl w-80 text-center animate-fadeIn">
          <p className="font-semibold text-gray-800">{message}</p>
          <div className="flex gap-3 mt-5">
            <button onClick={onNo} className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium">
              No
            </button>
            <button onClick={onYes} className="flex-1 py-2 rounded-lg bg-green-600 text-white font-medium">
              Yes
            </button>
          </div>
        </div>

        <style jsx>{`
          .animate-fadeIn {
            animation: fadeIn 0.18s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.97); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // ================== chooseMode (with confirm) ==================
  async function chooseMode(newMode) {
    const doAction = async () => {
      try {
        // set local UI instantly
        setPaymentMode(newMode);

        // If cash: lock immediately and mark pending server-side
        if (newMode === "cash") {
          setModeLocked(true);
        }

        // call server to set payment mode
        await fetch(`/api/orders/${orderId}/payment-mode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: newMode }),
        });

        if (newMode === "cash") {
          // mark pending immediately for cash
          await fetch(`/api/orders/${orderId}/mark-pending`, { method: "POST" });
          setOrder((prev) => ({ ...prev, paymentStatus: "pending", paymentMethod: "cash" }));
        } else {
          // UPI selected — do not mark pending yet, just set paymentMethod
          setOrder((prev) => ({ ...prev, paymentMethod: "upi" }));
        }
      } catch (err) {
        console.error("chooseMode error:", err);
        alert("Network error — try again");
      }
    };

    // If mode locked already and different, ask confirm extra
    if (modeLocked && paymentMode !== newMode) {
      setConfirmPopup({
        show: true,
        message: "Change payment method? This will clear previous progress.",
        onYes: () => {
          setConfirmPopup({ show: false, message: "", onYes: null, onNo: null });
          doAction();
        },
        onNo: () => setConfirmPopup({ show: false, message: "", onYes: null, onNo: null }),
      });
      return;
    }

    // normal flow: show confirmation before fixing
    setConfirmPopup({
      show: true,
      message: `Fix payment method to "${newMode === "cash" ? "Cash" : "UPI"}"?`,
      onYes: () => {
        setConfirmPopup({ show: false, message: "", onYes: null, onNo: null });
        doAction();
      },
      onNo: () => setConfirmPopup({ show: false, message: "", onYes: null, onNo: null }),
    });
  }

  // ================== userPaid (for UPI) ==================
  async function userPaid() {
    setConfirmPopup({
      show: true,
      message: "Are you sure you have paid the bill?",
      onYes: async () => {
        setConfirmPopup({ show: false, message: "", onYes: null, onNo: null });

        try {
          // tell server to mark pending (kitchen verifying)
          await fetch(`/api/orders/${orderId}/mark-pending`, { method: "POST" });

          // lock UI locally
          setModeLocked(true);

          // reflect state locally
          setOrder((prev) => ({ ...prev, paymentStatus: "pending", paymentMethod: prev?.paymentMethod || "upi" }));

          alert("Payment submitted — kitchen is verifying ✔");
        } catch (err) {
          console.error("userPaid error:", err);
          alert("Network error — try again");
        }
      },
      onNo: () => setConfirmPopup({ show: false, message: "", onYes: null, onNo: null }),
    });
  }

  // ================== helper to open UPI app or copy link on desktop ==================
  function openUPIApp(amount, label) {
    const upi = makeUPI(amount);
    // attempt to open via window.location -> mobile will open UPI app
    const opened = (() => {
      try {
        window.location.href = upi;
        return true;
      } catch (e) {
        return false;
      }
    })();

    // fallback: copy to clipboard and notify
    if (!opened) {
      navigator.clipboard?.writeText(upi).then(
        () => alert(`${label} deeplink copied — paste in your UPI app to pay.`),
        () => alert("Copy failed — please long-press the UPI ID to copy.")
      );
    }
  }

  // ================== download bill image ==================
  async function downloadBillImage() {
    const bill = document.getElementById("bill-area");
    if (!bill) return;
    const canvas = await html2canvas(bill, { scale: 3, useCORS: true, logging: false });
    const img = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = img;
    link.download = `Bill-${orderId}.png`;
    link.click();
  }

  // ================== UI small helpers ==================
  function StatusBadge() {
    if (paymentStatus === "cancelled")
      return <span className="px-3 py-1 bg-red-300 text-red-700 rounded-full text-xs">CANCELLED</span>;
    if (paymentStatus === "paid")
      return <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs">PAID</span>;
    if (paymentStatus === "pending")
      return (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-xs">PENDING</span>
          <span className="text-[10px] text-gray-500">Checking in kitchen…</span>
        </div>
      );
    return <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs">UNPAID</span>;
  }

  return (
    <>
      <ConfirmModal {...confirmPopup} />

      <div className="min-h-screen bg-gray-100 p-8 text-black">
        <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-8" id="bill-area">
          {/* header */}
          <div className="text-center border-b pb-4">
            <img src="/onebite.jpeg" className="mx-auto h-20 w-20 rounded-full shadow-md object-cover" />
            <h1 className="text-2xl font-extrabold mt-3">BILL RECEIPT</h1>
            <p className="text-gray-600 mt-1">Sanjauli, Shimla, Himachal Pradesh</p>
            <p className="text-gray-600">India</p>

            <div className="mt-2 text-sm font-semibold">
              Contact: <span className="font-bold">7812050001</span>
            </div>

            <div className="text-sm mt-3">
              <b>Date:</b> {formatDateTime(order.createdAt)}
            </div>
          </div>

          {/* meta */}
          <div className="mt-4 text-sm space-y-1">
            <p><b>Order ID:</b> {order._id}</p>
            <p><b>Table:</b> {order.tableName}</p>
            <p><b>KOT No:</b> {order.kotId || "N/A"}</p>
            <p><b>Status:</b> <StatusBadge /></p>
            <p><b>Customer:</b> {order.customerName}</p>
            <p><b>Phone:</b> {order.customerPhone}</p>
          </div>

          {/* items */}
          <div className="border-t border-b py-4 my-5">
            {order.items.map((item) => (
              <div key={item._id} className="flex justify-between py-2 text-sm font-medium">
                <span>{item.name} <span className="text-gray-500">(x{item.qty})</span></span>
                <span>₹{item.qty * item.price}</span>
              </div>
            ))}
          </div>

          {/* totals + paid badge */}
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

            <div className="flex items-center justify-between text-xl font-bold mt-3 border-t pt-3">
              <div className="flex items-center gap-3">
                <span>Total</span>
                {/* small paid dot next to total if paid */}
                {paymentStatus === "paid" && (
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white text-sm shadow">
                    ✓
                  </span>
                )}
              </div>

              <div className="text-right">
                <div className="text-xl">₹{finalTotal}</div>
                <div className="text-[11px] text-gray-500">{paymentStatus === "paid" ? "Paid" : "Pay at checkout"}</div>
              </div>
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
                  className={`flex-1 py-2 rounded-lg font-semibold ${paymentMode === "upi" ? "bg-green-600 text-white" : modeLocked && paymentMode !== "upi" ? "bg-gray-300 text-gray-500" : "bg-gray-200 text-black"}`}
                >
                  Pay via UPI
                </button>

                <button
                  onClick={() => chooseMode("cash")}
                  disabled={modeLocked}
                  className={`flex-1 py-2 rounded-lg font-semibold ${paymentMode === "cash" ? "bg-yellow-500 text-black" : modeLocked ? "bg-gray-300 text-gray-500" : "bg-gray-200 text-black"}`}
                >
                  Cash
                </button>
              </div>

              {/* CASH UI */}
              {paymentMode === "cash" && (
                <div className="mt-5 bg-yellow-100 p-4 rounded-lg border border-yellow-400">
                  <p className="font-bold text-yellow-800">Cash Payment Selected</p>
                  <p className="text-sm mt-1">Give ₹{finalTotal} to the staff.</p>
                </div>
              )}

              {/* UPI UI */}
              {paymentMode === "upi" && (
                <div className="mt-5 text-center">
                  <h3 className="font-bold">Pay via UPI</h3>

                  {/* QR */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(makeUPI(finalTotal))}`}
                    className="mx-auto border rounded-lg shadow mt-3"
                    alt="UPI QR"
                  />

                  {/* app buttons */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => openUPIApp(finalTotal, "GPay")}
                      className="py-2 rounded-lg bg-[#2d8cff] text-white font-semibold text-sm"
                    >
                      GPay
                    </button>

                    <button
                      onClick={() => openUPIApp(finalTotal, "PhonePe")}
                      className="py-2 rounded-lg bg-[#341f97] text-white font-semibold text-sm"
                    >
                      PhonePe
                    </button>

                    <button
                      onClick={() => openUPIApp(finalTotal, "Paytm")}
                      className="py-2 rounded-lg bg-[#ff6a00] text-white font-semibold text-sm"
                    >
                      Paytm
                    </button>
                  </div>

                  {/* user paid button */}
                  <button
                    onClick={userPaid}
                    disabled={modeLocked}
                    className={`mt-4 w-full py-2 rounded-lg font-semibold ${modeLocked ? "bg-gray-300 text-gray-500" : "bg-green-600 text-white"}`}
                  >
                    I Have Paid
                  </button>

                  <p className="text-xs text-gray-500 mt-2">If app doesn't open, tap GPay/PhonePe/Paytm or copy the UPI link above.</p>
                </div>
              )}
            </div>
          )}

          {/* PAID UI */}
          {paymentStatus === "paid" && (
            <div className="mt-8 bg-green-100 border border-green-400 p-4 rounded-lg text-center">
              <p className="font-bold text-green-700">Payment Successful ({order.paymentMethod?.toUpperCase()})</p>
            </div>
          )}

          {/* CANCELLED UI */}
          {paymentStatus === "cancelled" && (
            <div className="mt-8 bg-red-100 border border-red-400 p-4 rounded-lg text-center">
              <p className="font-bold text-red-700">Payment Cancelled — Please choose method again</p>
            </div>
          )}

          <p className="text-center text-xs text-gray-500 mt-8 border-t pt-4">
            Thank you for dining with us ❤️
            <br />
            <span className="text-[11px] opacity-70">Powered by Aman Digital Solutions</span>
          </p>
        </div>

        {/* actions */}
        <div className="flex gap-3 max-w-lg mx-auto mt-6">
          <button onClick={() => window.print()} className="flex-1 bg-black text-white py-3 rounded-lg">Print Bill</button>
          <button onClick={downloadBillImage} className="flex-1 bg-blue-600 text-white py-3 rounded-lg">Download Bill</button>
        </div>
      </div>
    </>
  );
}
