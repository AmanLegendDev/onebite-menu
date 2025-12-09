"use client";

import { useEffect, useState } from "react";

export default function BillPage({ params }) {
  const { orderId } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
        const data = await res.json();
        setOrder(data.order);
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


  // ============ VALUES ============
  const KOT = order.kotId || "N/A";

  const subtotal = order.items.reduce((sum, item) => sum + item.qty * item.price, 0);

  const gstAmount = Math.round(subtotal * 0.05);

  // ✔ If coupon applied → discount already in order.finalPrice
  const finalTotal = order.finalPrice ? order.finalPrice : subtotal + gstAmount;

  const paymentStatus = order.paymentStatus || "unpaid";

  // ============ QR MAKER ============
  function makeUPI(amount) {
    const upiID = "onzaman786-1@okaxis";
    const name = "OneBite";
    return `upi://pay?pa=${upiID}&pn=${name}&am=${amount}&cu=INR`;
  }

  function downloadBill() {
    const html = document.getElementById("bill-area").innerHTML;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bill-${order._id}.html`;
    a.click();
  }

  // BADGE COMPONENT
  function StatusBadge() {
    if (paymentStatus === "paid")
      return <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs">PAID</span>;

    if (paymentStatus === "pending")
      return <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-xs">PENDING</span>;

    return <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs">UNPAID</span>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">

      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-8" id="bill-area">

        {/* HEADER */}
        <div className="text-center border-b pb-4">
          <h1 className="text-3xl font-extrabold">ONEBITE SANJAULI</h1>
          <p className="text-gray-600 mt-1">Sanjauli, Shimla, Himachal Pradesh</p>
          <p className="text-gray-600">India</p>

          <p className="mt-2 text-sm font-semibold">
            Contact: <span className="font-bold">7812050001</span>
          </p>

          <p className="text-sm mt-3">
            <b>Date:</b> {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {/* ORDER META */}
        <div className="mt-4 text-sm space-y-1">
          <p><b>Order ID:</b> {order._id}</p>
          <p><b>Table:</b> {order.tableName}</p>
          <p><b>KOT No:</b> {KOT}</p>
          <p><b>Payment:</b> <StatusBadge /></p>

          <p><b>Customer:</b> {order.customerName}</p>
          <p><b>Phone:</b> {order.customerPhone}</p>
        </div>


        {/* ITEMS */}
        <div className="border-t border-b py-4 my-5">
          {order.items.map((item) => (
            <div key={item._id} className="flex justify-between py-2 text-sm font-medium">
              <span>
                {item.name} <span className="text-gray-500">(x{item.qty})</span>
              </span>
              <span>₹{item.qty * item.price}</span>
            </div>
          ))}
        </div>

        {/* NOTE */}
        {order.note && (
          <div className="bg-gray-100 p-3 rounded mb-4 text-sm">
            <b>Note:</b> {order.note}
          </div>
        )}

        {/* TOTALS */}
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="flex justify-between">
            <span>GST (5%)</span>
            <span>₹{gstAmount}</span>
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


        {/* QR SECTION */}
        {paymentStatus !== "paid" && (
          <div className="mt-10 text-center">
            <h2 className="text-lg font-bold">Pay via UPI</h2>

            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                makeUPI(finalTotal)
              )}`}
              alt="Payment QR"
              className="mx-auto border rounded-lg shadow-md mt-3"
            />

            <p className="text-xs text-gray-500 mt-2">Scan with any UPI app</p>
            <p className="text-xs text-gray-500">UPI ID: <b>onzaman786-1@okaxis</b></p>
          </div>
        )}

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-500 mt-8 border-t pt-4">
          Thank you for dining with OneBite ❤️  
          <br />
          <span className="text-[11px] opacity-70">Made with ❤️ by Aman</span>
        </p>
      </div>


      {/* ACTION BUTTONS */}
      <div className="flex gap-3 max-w-lg mx-auto mt-6">
        <button onClick={() => window.print()} className="flex-1 bg-black text-white py-3 rounded-lg">
          Print Bill
        </button>

        <button onClick={downloadBill} className="flex-1 bg-blue-600 text-white py-3 rounded-lg">
          Download Bill
        </button>
      </div>
    </div>
  );
}
