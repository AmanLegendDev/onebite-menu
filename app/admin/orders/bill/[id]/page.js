"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function AdminBillPage({ params }) {
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // FETCH ORDER DATA
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/orders/${id}`, { cache: "no-store" });
        const data = await res.json();
        setOrder(data.order);
      } catch (e) {
        console.log("Bill error:", e);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-400 text-xl">Loading bill…</div>
    );

  if (!order)
    return (
      <div className="p-10 text-center text-gray-400 text-xl">
        Order not found ❌
      </div>
    );

  // ===========================
  // CALCULATIONS
  // ===========================
  const subtotal = order.items.reduce((t, i) => t + i.price * i.qty, 0);

  const discount = order.discount || 0;
  const finalPrice = order.finalPrice || subtotal - discount;

  // GST OFF (CLIENT WANTS NO GST RIGHT NOW)
  const gstAmount = 0;

  // PAYMENT STATUS BADGE
  const statusLabel = {
    unpaid: "Pending Payment",
    paid: "Paid",
    cash: "Cash Payment",
  }[order.paymentStatus || "unpaid"];

  const badgeColor = {
    unpaid: "bg-red-500",
    paid: "bg-green-500",
    cash: "bg-yellow-500 text-black",
  }[order.paymentStatus || "unpaid"];

  // KOT NUMBER (YOUR OLD STYLE)
const kotNo = order.kotId || "N/A";


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
    <div className="min-h-screen bg-gray-100 p-6 sm:p-10 text-black">
      {/* BILL BOX */}
      <div
        className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8 border"
        id="bill-area"
      >
        {/* HEADER */}
        <div className="text-center border-b pb-4">
          <div className="flex justify-center mb-3">
            <Image
              src="/onebite-2.jpg"
              width={80}
              height={80}
              alt="logo"
              className="rounded-full border border-[#FFB100]"
            />
          </div>

          <h1 className="text-2xl font-extrabold">ONEBITE SANJAULI</h1>
          <p className="text-sm text-gray-600">
            Sanjauli, Shimla, Himachal Pradesh
          </p>
          <p className="text-sm text-gray-600">Restaurant Contact: 7812050001</p>

          <p className="mt-3 text-sm">
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
            <b>KOT No:</b> {kotNo}
          </p>
          <p>
            <b>Customer:</b> {order.customerName || "N/A"}
          </p>
          <p>
            <b>Phone:</b> {order.customerPhone || "N/A"}
          </p>

          {/* PAYMENT STATUS */}
          <div className={`inline-block px-3 py-1 mt-2 rounded-full text-xs font-bold text-white ${badgeColor}`}>
            {statusLabel}
          </div>
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

          {discount > 0 && (
            <div className="flex justify-between text-green-600 font-semibold">
              <span>Discount</span>
              <span>-₹{discount}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>GST</span>
            <span>₹0</span>
          </div>

          <div className="flex justify-between text-xl font-bold mt-4 border-t pt-3">
            <span>Total Payable</span>
            <span className="text-[#FF6A3D]">₹{finalPrice}</span>
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-500 mt-8 border-t pt-4">
          Thank you for dining with OneBite ❤️ <br />
          <span className="text-[10px] opacity-70">Made by Aman Digital Solutions</span>
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
