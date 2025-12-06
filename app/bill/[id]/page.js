"use client";

import { useEffect, useState } from "react";

export default function BillPage({ params }) {
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch order by ID
  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${id}`, { cache: "no-store" });
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
      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-8" id="bill-area">
        
        {/* RESTAURANT HEADER */}
        <h1 className="text-2xl font-bold text-center">ONEBITE SANJAULI</h1>
        <p className="text-center text-gray-600 mb-2">Sanjauli, Shimla, Himachal Pradesh</p>
        <p className="text-center text-xl mb-2 foint-bold">India</p>
        <p className="text-center">Contact No: 7812050001</p>
                <p className="text-sm mb-4 text-center"><b>Date:</b> {new Date(order.createdAt).toLocaleString()}</p>


        {/* ORDER INFO */}
        <p className="text-sm mb-1"><b>Order ID:</b> {order._id}</p>
        <p className="text-sm mb-1"><b>Table:</b> {order.table}</p>

        {/* ITEMS */}
        <div className="border-t border-b py-4 mb-4">
          {order.items.map((item) => (
            <div key={item._id} className="flex justify-between py-1">
              <span>{item.name} (x{item.qty})</span>
              <span>₹{item.qty * item.price}</span>
            </div>
          ))}
        </div>

        {/* NOTE */}
        {order.note && (
          <p className="text-sm bg-gray-100 p-3 rounded mb-4">
            <b>Note:</b> {order.note}
          </p>
        )}

        {/* TOTAL */}
        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span>₹{order.totalPrice}</span>
        </div>

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

      <div className="max-w-lg mx-auto mt-4">
        <a href="/order-success" className="text-blue-600 underline">
          ← Back to Orders
        </a>
      </div>
    </div>
  );
}
