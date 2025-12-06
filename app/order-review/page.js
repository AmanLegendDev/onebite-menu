"use client";

import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderReviewPage() {
  const { cart } = useCart();
  const router = useRouter();

  const [savedCart, setSavedCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [table, setTable] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [autoTableInfo, setAutoTableInfo] = useState(null);



  useEffect(() => {
  if (typeof window === "undefined") return;

  const info = sessionStorage.getItem("tableInfo");
  if (info) {
    try {
      const parsed = JSON.parse(info);
      setAutoTableInfo(parsed);

      // replace existing manual table number
      if (parsed.name || parsed.number) {
        setTable(parsed.name || `Table ${parsed.number}`);
      }
    } catch {}
  }
}, []);


  // Restore cart after refresh
  useEffect(() => {
    const stored = localStorage.getItem("cart_data");
    if (stored) {
      try {
        setSavedCart(JSON.parse(stored));
      } catch {}
    }
    setTimeout(() => setLoading(false), 50);
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading your order…
      </div>
    );

  const finalCart = cart.length > 0 ? cart : savedCart;

  const totalQty = finalCart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = finalCart.reduce((s, i) => s + i.qty * i.price, 0);

  async function placeOrder() {
    if (!table) return alert("Please enter table number!");

const baseTableName =
  autoTableInfo?.name ||
  (autoTableInfo?.number ? `Table ${autoTableInfo.number}` : null) ||
  table;

const user = JSON.parse(localStorage.getItem("onebite_user"));



const orderData = {
  items: finalCart,
  totalQty,
  totalPrice,
  table: baseTableName,      // OLD FIELD for backward compatibility
  tableName: baseTableName,  // NEW FIELD
  tableId: autoTableInfo?.id || null,  // NEW FIELD
  customerSessionId: user?.sessionId || null,
  customerName: user?.name || "",
  customerPhone: user?.phone || "",
  note,
  createdAt: new Date(),
};

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem(
        "latestOrder",
        JSON.stringify({ ...orderData, _id: data.order._id })
      );

      if (navigator.vibrate) navigator.vibrate([120, 60, 120]);

      router.replace("/order-success");
    } else {
      alert("Order failed. Try again!");
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6] px-4 py-6 pb-28 text-black">

      {/* HEADER */}
      <h1 className="text-3xl font-extrabold tracking-tight text-[#111]">
        Review Your Order
      </h1>
      <p className="text-gray-600 text-sm mt-1 mb-4">
        Please confirm everything before placing your order.
      </p>

      {/* SECTION TITLE */}
      <h2 className="text-lg font-bold text-[#111] mb-2">Order Summary</h2>
      <div className="h-[2px] bg-[#FFB100] w-20 mb-6 rounded-full" />

      {/* ITEMS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {finalCart.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 flex flex-col"
          >
            <img
              src={item.image}
              className="w-full h-24 rounded-lg object-cover"
            />

            <h2 className="font-semibold text-sm mt-2">{item.name}</h2>

            <p className="text-gray-600 text-xs mt-1">
              {item.qty} × ₹{item.price}
            </p>

            <p className="font-bold text-[#FFB100] text-right mt-auto text-sm">
              ₹{item.qty * item.price}
            </p>
          </div>
        ))}
      </div>

      {/* DETAILS INPUT */}
      <h2 className="text-lg font-bold text-[#111] mt-8 mb-2">
        Your Details
      </h2>
      <div className="h-[2px] bg-[#FFB100] w-20 mb-6 rounded-full" />

      {/* TABLE NUMBER */}
<div className="mb-5">
  <label className="font-semibold text-sm block mb-1">
    Table <span className="text-red-500">*</span>
  </label>

  {autoTableInfo ? (
    <div className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-800 font-semibold">
      {autoTableInfo.name ||
        (autoTableInfo.number ? `Table ${autoTableInfo.number}` : table)}
    </div>
  ) : (
    <input
      type="number"
      placeholder="Enter table number"
      value={table}
      onChange={(e) => setTable(e.target.value)}
      className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-[#FFB100] outline-none transition"
    />
  )}
</div>


      {/* NOTE */}
      <label className="font-semibold text-sm block mb-1">
        Note (optional)
      </label>
      <textarea
        placeholder="Any instructions? (extra cheese, less spicy...)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full p-3 rounded-lg border border-gray-300 bg-white min-h-[90px] focus:ring-2 focus:ring-[#FFB100]"
      />

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-lg shadow-[0_-3px_10px_rgba(0,0,0,0.2)] py-4 px-5 border-t flex justify-between items-center z-50">
        <p className="font-semibold text-[16px] text-[#111]">
          {totalQty} items • ₹{totalPrice}
        </p>

        <button
          onClick={placeOrder}
          className="bg-[#FFB100] text-black px-7 py-2.5 rounded-full font-bold shadow-lg active:scale-95 transition"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
