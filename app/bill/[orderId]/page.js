"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function BillPage({ params }) {
  const { orderId } = params;
  const [order, setOrder] = useState(null);

  useEffect(() => {
    async function fetchOrder() {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) setOrder(data.order);
    }
    fetchOrder();
  }, [orderId]);

  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        Loading bill…
      </div>
    );

  // Calculate subtotal
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  const kotNumber = order.customerSessionId?.slice(-6).toUpperCase(); // AUTO KOT

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-xl p-6 border border-gray-200">

        {/* HEADER */}
        <div className="flex flex-col items-center">
          <Image
            src="/onebite-2.jpg"
            width={90}
            height={90}
            alt="OneBite Logo"
            className="rounded-full shadow-lg border-2 border-yellow-500"
          />
          <h1 className="mt-3 text-2xl font-extrabold tracking-wide text-gray-900">
            ONEBITE
          </h1>
          <p className="text-sm text-gray-500 -mt-1">Premium Digital Dining</p>
        </div>

        <div className="mt-6 border-t border-b py-3">
          <div className="flex justify-between text-sm font-semibold text-gray-700">
            <p>Bill No:</p>
            <p>{order._id.slice(-8).toUpperCase()}</p>
          </div>

          <div className="flex justify-between text-sm font-semibold text-gray-700 mt-2">
            <p>KOT No:</p>
            <p className="text-red-600 font-bold">{kotNumber}</p>
          </div>

          <div className="flex justify-between text-sm font-semibold text-gray-700 mt-2">
            <p>Table:</p>
            <p>{order.tableName}</p>
          </div>

          <div className="flex justify-between text-sm text-gray-700 mt-2">
            <p>Date:</p>
            <p>{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* CUSTOMER INFO */}
        <div className="mt-4">
          <p className="text-sm text-gray-700 font-semibold">Customer</p>
          <p className="text-gray-900 font-bold">
            {order.customerName || "N/A"}
          </p>
          <p className="text-gray-600 text-sm">
            {order.customerPhone || ""}
          </p>
        </div>

        {/* ITEMS */}
        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Order Items</h3>

          {order.items.map((item) => (
            <div
              key={item._id}
              className="flex justify-between py-2 border-b text-sm"
            >
              <div>
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-gray-500 text-xs">
                  {item.qty} × ₹{item.price}
                </p>
              </div>
              <p className="font-bold text-gray-900">
                ₹{item.qty * item.price}
              </p>
            </div>
          ))}
        </div>

        {/* TOTALS */}
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between text-sm text-gray-700">
            <p>Subtotal</p>
            <p>₹{subtotal}</p>
          </div>

          <div className="flex justify-between text-sm text-gray-700 mt-2">
            <p>GST (5%)</p>
            <p>₹{(subtotal * 0.05).toFixed(0)}</p>
          </div>

          <div className="flex justify-between text-lg font-extrabold text-gray-900 mt-3">
            <p>Total</p>
            <p>₹{(subtotal * 1.05).toFixed(0)}</p>
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Thank you for dining with OneBite ❤️
        </p>
      </div>
    </div>
  );
}
