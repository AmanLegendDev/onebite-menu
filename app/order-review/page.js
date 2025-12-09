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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Coupon state
  const [couponInfo, setCouponInfo] = useState(null);
  const [couponApplied, setCouponApplied] = useState(false);
  const [finalCart, setFinalCart] = useState([]);

  // Load table + customer
  useEffect(() => {
    if (typeof window === "undefined") return;

    const info = sessionStorage.getItem("tableInfo");
    const user = localStorage.getItem("onebite_user");

    if (info) setAutoTableInfo(JSON.parse(info));
    if (user) setCustomer(JSON.parse(user));
  }, []);

  // Load coupon clean object
  useEffect(() => {
    if (!customer?.phone) return;

    async function loadCoupon() {
      try {
        const res = await fetch(
          `/api/customer-users/coupon?phone=${customer.phone}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        if (data.success && data.coupon?.active && data.coupon.amount > 0) {
          // Normalize coupon object
          const c = data.coupon;

          const fixed = {
            active: true,
            type: c.type || "flat",
            amount: Number(c.amount) || 0,
            maxDiscount:
              c.maxDiscount === null || c.maxDiscount === undefined
                ? null
                : Number(c.maxDiscount),
            code: c.code || null,
          };

          setCouponInfo(fixed);
        } else {
          setCouponInfo(null);
        }
      } catch (err) {}
    }

    loadCoupon();
  }, [customer]);

  // Restore cart
  useEffect(() => {
    const stored = localStorage.getItem("cart_data");
    if (stored) setSavedCart(JSON.parse(stored));

    setTimeout(() => setLoading(false), 80);
  }, []);

  // Merge cart
  useEffect(() => {
    if (!loading) {
      const fc = cart.length > 0 ? cart : savedCart;
      setFinalCart(fc);
    }
  }, [loading, cart, savedCart]);

  // Auto redirect if empty
  useEffect(() => {
    if (loading) return;
    if (!finalCart) return;

    if (finalCart.length === 0) {
      const stored = localStorage.getItem("cart_data");
      const storedParsed = stored ? JSON.parse(stored) : [];

      if (storedParsed.length === 0) {
        const info = sessionStorage.getItem("tableInfo");
        const table = info ? JSON.parse(info) : null;

        if (table?.id) router.replace(`/table/${table.id}/menu`);
        else router.replace("/");
      }
    }
  }, [loading, finalCart]);

  if (loading || finalCart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  // -------------------------
  // PRICE CALCULATIONS
  // -------------------------

  const totalQty = finalCart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = finalCart.reduce((s, i) => s + i.qty * i.price, 0);

  let discount = 0;

  if (couponApplied && couponInfo) {
    if (couponInfo.type === "flat") {
      // Flat discount
      discount = Math.min(couponInfo.amount, totalPrice);
    } else if (couponInfo.type === "percent") {
      const raw = (totalPrice * couponInfo.amount) / 100;
      discount = couponInfo.maxDiscount
        ? Math.min(raw, couponInfo.maxDiscount)
        : raw;
    }
  }

  const payableTotal = Math.max(0, totalPrice - discount);

  // -------------------------
  // PLACE ORDER
  // -------------------------

  async function placeOrder() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const baseTableName =
      autoTableInfo?.name ||
      (autoTableInfo?.number ? `Table ${autoTableInfo.number}` : "Unknown");

    const orderData = {
      items: finalCart,
      totalQty,
      totalPrice,
      discount,
      finalPrice: payableTotal,
      couponCode: couponApplied ? couponInfo?.code : null,
      table: baseTableName,
      tableName: baseTableName,
      tableId: autoTableInfo?.id || null,
      customerSessionId: customer?.sessionId || null,
      customerName: customer?.name || "",
      customerPhone: customer?.phone || "",
      note,
      createdAt: new Date(),
    };

    // -------------------------
// KOT DATA (for kitchen)
// -------------------------
// ===========================
// KOT DATA (for kitchen)
// ===========================
const kotData = {
  table: baseTableName,
  tableId: autoTableInfo?.id || null,
  customerName: customer?.name || "",
  customerPhone: customer?.phone || "",
  items: finalCart.map((i) => ({
    name: i.name,
    qty: i.qty,
  })),
  note,
};


    await fetch("/api/customer-users/create-or-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: customer?.name,
        phone: customer?.phone,
      }),
    });

    

    await fetch("/api/kot", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(kotData),
  });


  


    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      // After order is successfully saved
for (let item of finalCart) {
  await fetch(`/api/items/${item._id}/reduce-stock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qty: item.qty }),
  });
}

      const data = await res.json();

      if (data.success) {
        const orderId = data.order._id;

        localStorage.setItem(
          "latestOrder",
          JSON.stringify({ ...orderData, _id: orderId })
        );

        if (couponApplied && customer?.phone) {
          fetch("/api/customer-users/coupon-consume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: customer.phone, orderId }),
          });
        }

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

  // -------------------------
  // UI STARTS HERE
  // -------------------------

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white px-4 py-6 pb-28">
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

            <p className="text-yellow-400 text-lg font-bold flex items-center">
              ₹{item.qty * item.price}
            </p>
          </div>
        ))}
      </div>

      {/* BILL SECTION */}
      <div className="mt-8 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-300">Subtotal</span>
          <span className="font-semibold">₹{totalPrice}</span>
        </div>

        {couponInfo && (
          <div className="flex justify-between text-green-400">
            <span>
              {couponApplied ? "Coupon applied" : "Coupon available"}
            </span>

            <span>
              -₹
              {couponApplied
                ? discount
                : couponInfo.type === "flat"
                ? couponInfo.amount
                : `${couponInfo.amount}%`}
            </span>
          </div>
        )}

        <div className="flex justify-between text-lg font-bold mt-2">
          <span>Total Payable</span>
          <span className="text-yellow-400">₹{payableTotal}</span>
        </div>
      </div>

      {/* COUPON APPLY BOX */}
      {couponInfo && !couponApplied && (
        <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/40 text-sm flex justify-between items-center">
          <div>
            <p className="font-semibold text-green-300">
              🎁{" "}
              {couponInfo.type === "flat"
                ? `₹${couponInfo.amount} OFF`
                : `${couponInfo.amount}% OFF ${
                    couponInfo.maxDiscount
                      ? `(Max ₹${couponInfo.maxDiscount})`
                      : ""
                  }`}
            </p>
            <p className="text-gray-400 text-xs">Will apply on this bill.</p>
          </div>

          <button
            onClick={() => setCouponApplied(true)}
            className="bg-green-500 text-black px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-green-400"
          >
            Apply
          </button>
        </div>
      )}

      {/* NOTE */}
      <h2 className="text-xl font-bold mt-10">Add Note</h2>
      <div className="h-[2px] bg-yellow-400 w-20 rounded-full mb-3" />

      <textarea
        placeholder="Any instructions?"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-gray-700 text-white min-h-[100px]"
      />

      {/* BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-[#1a1a1a] border-t border-yellow-400 px-5 py-4 flex justify-between items-center z-50">
        <p className="font-semibold text-yellow-300 text-lg">
          {totalQty} items • ₹{payableTotal}
        </p>

        <button
          onClick={placeOrder}
          disabled={isSubmitting}
          className={`px-7 py-2.5 rounded-full font-bold transition active:scale-95 ${
            isSubmitting
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
