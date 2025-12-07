"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function UserOrderHistoryPage() {
  const { phone } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/orders/by-user?phone=${phone}`, {
        cache: "no-store",
      });

      const data = await res.json();
      if (data.success) setOrders(data.orders);
      setLoading(false);
    }

    load();
  }, [phone]);

  if (loading)
    return (
      <div className="text-gray-400 p-10 text-center">
        Loading order history...
      </div>
    );

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-extrabold mb-2">Customer Orders</h1>
      <p className="text-gray-400 mb-6">Phone: {phone}</p>

      {orders.length === 0 && (
        <p className="text-gray-500 text-lg">No orders yet.</p>
      )}

      <div className="space-y-6">
        {orders.map((o) => (
          <div
            key={o._id}
            className="bg-[#111] border border-[#222] p-5 rounded-xl shadow-xl"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-yellow-400">
                ₹{o.totalPrice}
              </h2>

              <Link
                href={`/admin/orders/bill/${o._id}`}
                className="px-3 py-1 text-sm bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400"
              >
                View Bill PDF →
              </Link>
            </div>

            <p className="text-sm text-gray-400 mb-2">
              Date: {new Date(o.createdAt).toLocaleString()}
            </p>

            {/* ITEMS */}
            <div className="space-y-3 border-t border-gray-700 pt-3">
              {o.items.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between text-sm text-gray-300"
                >
                  <p>
                    {item.name}{" "}
                    <span className="text-gray-500">
                      (₹{item.price} × {item.qty})
                    </span>
                  </p>
                  <p className="font-bold text-yellow-400">
                    ₹{item.qty * item.price}
                  </p>
                </div>
              ))}
            </div>

            {/* TOTAL */}
            <div className="flex justify-between font-semibold text-lg mt-4">
              <p>Total</p>
              <p>₹{o.totalPrice}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
