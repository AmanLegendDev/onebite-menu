"use client";

import { useEffect, useState } from "react";

export default function OrderSuccessPage() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Jis order ko humne place kiya, use localStorage mein save kar rahe the
    const savedOrder = localStorage.getItem("latestOrder");

    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading your order...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] px-6 py-10 text-black">

      {/* Success Badge */}
      <div className="text-center">
        <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto text-4xl font-bold">
          ✓
        </div>

        <h1 className="text-3xl font-bold mt-4">Order Placed!</h1>
        <p className="text-gray-600 mt-2">
          Your order has been successfully sent to the kitchen.
        </p>
      </div>

      {/* ORDER DETAILS BOX */}
      <div className="bg-white rounded-xl shadow p-5 mt-8">

        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        {/* ITEMS LIST */}
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item._id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#111]">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.qty} × ₹{item.price}
                </p>
              </div>

              <p className="font-semibold text-[#ff6a3d]">
                ₹{item.qty * item.price}
              </p>
            </div>
          ))}
        </div>

        <hr className="my-4" />

        {/* TOTAL */}
        <div className="flex justify-between text-lg font-bold">
          <p>Total</p>
          <p>₹{order.totalPrice}</p>
        </div>

        {/* TABLE NUMBER */}
        <div className="mt-4 bg-gray-100 p-3 rounded-lg text-center">
          <p className="font-semibold text-gray-700">
            Table Number: <span className="text-[#ff6a3d]">{order.table}</span>
          </p>
        </div>

        {/* TIME */}
        <p className="text-center text-sm text-gray-500 mt-3">
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      {/* BUTTON */}
      <div className="mt-10 text-center">
        <button
          onClick={() => window.location.href = "/menu"}
          className="bg-[#ff6a3d] text-white px-8 py-3 rounded-full text-lg font-semibold"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}
