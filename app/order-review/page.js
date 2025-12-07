"use client";

import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderReviewPage() {
  const { cart, increaseQty, decreaseQty } = useCart();
  const router = useRouter();

  const [savedCart, setSavedCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [autoTableInfo, setAutoTableInfo] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // 🔥 prevents double orders

  // Fetch tableInfo + customer
  useEffect(() => {
    if (typeof window === "undefined") return;

    const info = sessionStorage.getItem("tableInfo");
    const user = localStorage.getItem("onebite_user");

    if (info) setAutoTableInfo(JSON.parse(info));
    if (user) setCustomer(JSON.parse(user));
  }, []);

  // Restore cart if refreshed
  useEffect(() => {
    const stored = localStorage.getItem("cart_data");
    if (stored) setSavedCart(JSON.parse(stored));
    setTimeout(() => setLoading(false), 80);
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading…
      </div>
    );

  const finalCart = cart.length > 0 ? cart : savedCart;

  const totalQty = finalCart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = finalCart.reduce((s, i) => s + i.qty * i.price, 0);

  // 🔥 SAFE ORDER PLACE FUNCTION (zero double submit)
  async function placeOrder() {
    if (isSubmitting) return;     // 🛑 prevents multiple clicks
    setIsSubmitting(true);        // ⏳ lock button

    const baseTableName =
      autoTableInfo?.name ||
      (autoTableInfo?.number ? `Table ${autoTableInfo.number}` : null);

    const orderData = {
      items: finalCart,
      totalQty,
      totalPrice,
      table: baseTableName,
      tableName: baseTableName,
      tableId: autoTableInfo?.id || null,
      customerSessionId: customer?.sessionId || null,
      customerName: customer?.name || "",
      customerPhone: customer?.phone || "",
      note,
      createdAt: new Date(),
    };

    try {
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

        if (navigator.vibrate) navigator.vibrate([100, 60, 100]);

        router.replace("/order-success");
      } else {
        alert("Order failed. Try again!");
        setIsSubmitting(false);
      }
    } catch (err) {
      alert("Network error!");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white px-4 py-6 pb-28">

      {/* HEADER */}
      <h1 className="text-4xl font-extrabold text-yellow-400 tracking-wide">
        Review Order 🧾
      </h1>

      {customer && (
        <p className="text-gray-300 text-sm mt-2">
          👤 {customer.name} • 📱 {customer.phone}
        </p>
      )}

      {autoTableInfo && (
        <p className="text-yellow-300 text-sm mt-1 font-semibold">
          Table: {autoTableInfo.name || `Table ${autoTableInfo.number}`}
        </p>
      )}

      {/* ORDER SUMMARY */}
      <h2 className="text-xl font-bold mt-8">Items</h2>
      <div className="h-[2px] bg-yellow-400 w-20 rounded-full mb-6" />

      <div className="space-y-5">
        {finalCart.map((item) => (
          <div
            key={item._id}
            className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-4 flex gap-4 shadow-lg"
          >
            <img
              src={item.image}
              className="w-20 h-20 rounded-lg object-cover border border-gray-600"
            />

            <div className="flex flex-col flex-grow">
              <h3 className="font-bold text-lg">{item.name}</h3>

              <p className="text-gray-400 text-sm">
                ₹{item.price} × {item.qty}
              </p>

              {/* QTY CONTROL */}
              <div className="flex items-center gap-3 mt-auto">
                <button
                  onClick={() => decreaseQty(item._id)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-full text-xl font-bold hover:bg-gray-600"
                >
                  –
                </button>

                <span className="text-yellow-400 text-lg font-semibold">
                  {item.qty}
                </span>

                <button
                  onClick={() => increaseQty(item._id)}
                  className="w-8 h-8 flex items-center justify-center bg-yellow-400 text-black rounded-full text-xl font-bold hover:bg-yellow-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* ITEM TOTAL */}
            <p className="text-yellow-400 text-lg font-bold flex items-center">
              ₹{item.qty * item.price}
            </p>
          </div>
        ))}
      </div>

      {/* NOTE */}
      <h2 className="text-xl font-bold mt-10">Add Note</h2>
      <div className="h-[2px] bg-yellow-400 w-20 rounded-full mb-3" />

      <textarea
        placeholder="Any instructions? (extra cheese, less spicy...)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-gray-700 text-white min-h-[100px] focus:ring-2 focus:ring-yellow-400 outline-none"
      />

      {/* BOTTOM FOOTER */}
      <div className="fixed bottom-0 left-0 w-full bg-[#1a1a1a] border-t border-yellow-400 px-5 py-4 flex justify-between items-center z-50">
        <p className="font-semibold text-yellow-300 text-lg">
          {totalQty} items • ₹{totalPrice}
        </p>

        <button
          onClick={placeOrder}
          disabled={isSubmitting}
          className={`px-7 py-2.5 rounded-full font-bold transition active:scale-95 
            ${isSubmitting 
              ? "bg-gray-500 text-black cursor-not-allowed" 
              : "bg-yellow-400 text-black hover:bg-yellow-300"
            }`}
        >
          {isSubmitting ? "Confirming..." : "Confirm Order →"}
        </button>
      </div>
    </div>
  );
}
