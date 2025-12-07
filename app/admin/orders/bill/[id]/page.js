"use client";

import { useEffect, useState } from "react";

export default function BillPage({ params }) {
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
console.log(order)
  // Fetch order by ID
  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`, { cache: "no-store" }) 
        const data = await res.json();
        setOrder(data.order);
      } catch (err) {
        console.log("Bill fetch error:", err);
      }
      setLoading(false);
    }
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-300 text-xl">
        Loading bill...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-10 text-center text-gray-300 text-xl">
        Order not found ❌
      </div>
    );
  }

  // KOT NUMBER
  const KOT = order.customerSessionId
    ? order.customerSessionId.slice(-6).toUpperCase()
    : "N/A";

  // TAX CALCULATION
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  const gstAmount = subtotal * 0.05;
  const finalTotal = subtotal + gstAmount;

  function downloadBill() {
    const content = document.getElementById("bill-area").innerHTML;
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `bill-${order._id}.html`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div
        className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-8"
        id="bill-area"
      >
        {/* HEADER */}
        <div className="text-center border-b pb-4">
          <h1 className="text-3xl font-extrabold">ONEBITE SANJAULI</h1>
          <p className="text-gray-600 mt-1">
            Sanjauli, Shimla, Himachal Pradesh
          </p>
          <p className="text-gray-600">India</p>

          <p className="text-sm mt-2 font-semibold">
            Restaurant Contact: <span className="font-semibold">7812050001</span>
          </p>

          <p className="text-sm mt-3">
            <b>Date:</b> {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        {/* ORDER META */}
        <div className="mt-4 text-sm space-y-1">
          <p>
            <b>Order ID:</b> {order._id}
          </p>
          <p>
            <b>Table No:</b> {order.table}
          </p>
          <p>
            <b>KOT No:</b> {KOT}
          </p>

          {/* CUSTOMER DETAILS */}
          <p>
            <b>Customer:</b> {order.customerName}
          </p>
          <p>
            <b>Contact:</b> {order.customerPhone}
          </p>
        </div>

        {/* ITEMS */}
        <div className="border-t border-b py-4 my-5">
          {order.items.map((item) => (
            <div
              key={item._id}
              className="flex justify-between py-2 text-sm font-medium"
            >
              <span>
                {item.name}{" "}
                <span className="text-gray-500">(x{item.qty})</span>
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
            <span>₹{gstAmount.toFixed(0)}</span>
          </div>

          <div className="flex justify-between text-xl font-bold mt-3 border-t pt-3">
            <span>Total</span>
            <span>₹{finalTotal.toFixed(0)}</span>
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-500 mt-8 border-t pt-4">
          Thank you for dining with OneBite ❤️
          <br />
          <span className="text-[11px] opacity-70">
            Made with ❤️ by Aman
          </span>
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 max-w-lg mx-auto mt-6">
        <button
          onClick={() => window.print()}
          className="flex-1 bg-black text-white py-3 rounded-lg font-semibold"
        >
          Print Bill
        </button>

        <button
          onClick={downloadBill}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold"
        >
          Download Bill
        </button>
      </div>

      <div className="max-w-lg mx-auto mt-4 text-center">
        <a href="/admin/orders" className="text-blue-600 underline">
          ← Back to Orders
        </a>
      </div>
    </div>
  );
}
