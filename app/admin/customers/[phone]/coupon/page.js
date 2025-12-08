"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomerCouponPage() {
  const { phone } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState(null);
  const [history, setHistory] = useState([]);


  // Form states
  const [type, setType] = useState("flat");
  const [amount, setAmount] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  // 🔹 Load coupon for this customer
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/customer-users/coupon?phone=${phone}`, {
          cache: "no-store",
        });


        const data = await res.json();
        console.log("API RAW RESPONSE:", data);
      

        if (data.success && data.coupon) {
          const c = data.coupon;
          console.log("COUPON OBJECT FROM API:", c);
          console.log("COUPON HISTORY FROM API:", c.history);

          setCoupon(c);

          setType(c.type || "flat");
          setAmount(c.amount ? String(c.amount) : "");
          setMaxDiscount(
            c.maxDiscount !== null && c.maxDiscount !== undefined
              ? String(c.maxDiscount)
              : ""
          );
          setCode(c.code || "");
          setNote(c.note || "");
          setHistory(c.history || []);
          console.log("FINAL HISTORY STATE:", c.history);


        }
      } catch (err) {
        console.error("Coupon load failed:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [phone]);

  // 🔹 Save coupon
  async function handleSave(e) {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid discount value.");
      return;
    }

    if (type === "percent" && (!maxDiscount || Number(maxDiscount) <= 0)) {
      alert("Please set a max discount (₹) for percentage coupons.");
      return;
    }

    setSaving(true);

    const body = {
      phone,
      type,
      amount: Number(amount),
      maxDiscount: type === "percent" ? Number(maxDiscount) : null,
      code: code || null,
      note,
      active: true,
    };

    try {
      const res = await fetch("/api/customer-users/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setSaving(false);

      if (!data.success) {
        alert(data.message || "Failed to save coupon");
        return;
      }

      setCoupon(data.coupon);
      alert("Coupon saved successfully ✅");
      router.refresh();
    } catch (err) {
      console.error("Coupon save failed:", err);
      setSaving(false);
      alert("Network error while saving coupon");
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-gray-400">
        Loading customer coupon…
      </div>
    );
  }

  const hasHistory = history.length > 0;


  return (
    <div className="p-6 text-white max-w-2xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-extrabold">Customer Coupon</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage personal discounts & see usage history.
          </p>
        </div>

        <Link
          href="/admin/customers"
          className="text-sm text-gray-300 hover:text-white underline"
        >
          ← Back to Customers
        </Link>
      </div>

      <p className="text-gray-400 mb-4 text-sm">
        Phone: <span className="font-mono text-gray-200">{phone}</span>
      </p>

      {/* ACTIVE COUPON CARD */}
      {coupon?.active ? (
        <div className="mb-6 p-4 rounded-xl bg-[#101010] border border-green-500/50 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs uppercase tracking-wide text-green-400 font-semibold">
              Active Coupon
            </p>
            <span className="px-2 py-0.5 rounded-full text-[11px] bg-green-500/20 text-green-300 border border-green-500/40">
              LIVE
            </span>
          </div>

          <p className="mt-1 text-xl font-bold">
            {coupon.type === "flat" ? (
              <>₹{coupon.amount} OFF</>
            ) : (
              <>
                {coupon.amount}% OFF{" "}
                {coupon.maxDiscount && (
                  <span className="text-sm text-gray-300">
                    (Max ₹{coupon.maxDiscount})
                  </span>
                )}
              </>
            )}
            {coupon.code && (
              <span className="ml-2 text-sm text-yellow-300">
                • Code: {coupon.code}
              </span>
            )}
          </p>

          {coupon.note && (
            <p className="mt-2 text-xs text-gray-400">
              Note: {coupon.note}
            </p>
          )}

          <p className="mt-3 text-[11px] text-gray-500">
            This will auto-apply on the customer&apos;s next order review screen.
          </p>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-xl bg-[#101010] border border-[#333]">
          <p className="text-sm text-gray-300">
            No active coupon for this customer right now.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Create one below (flat ₹ off or % off with max cap).
          </p>
        </div>
      )}

      {/* FORM CARD */}
      <form
        onSubmit={handleSave}
        className="space-y-4 bg-[#101010] p-5 rounded-xl border border-[#222] shadow-xl"
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold">Create / Update Coupon</h2>
          <span className="text-[11px] text-gray-500">
            Super simple — no training needed.
          </span>
        </div>

        {/* Type Selector */}
        <div>
          <label className="block text-sm mb-1">Coupon Type</label>
          <select
            className="w-full bg-black border border-[#333] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="flat">Flat Discount (₹)</option>
            <option value="percent">Percentage Discount (%)</option>
          </select>
          <p className="text-[11px] text-gray-500 mt-1">
            Flat = direct rupee off. Percentage = {`%`} with a max limit.
          </p>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm mb-1">
            {type === "flat" ? "Amount (₹)" : "Percentage (%)"}
          </label>
          <input
            type="number"
            min="1"
            className="w-full bg-black border border-[#333] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={type === "flat" ? "Example: 50" : "Example: 10"}
          />
        </div>

        {/* Max discount - only for percent type */}
        {type === "percent" && (
          <div>
            <label className="block text-sm mb-1">Max Discount (₹)</label>
            <input
              type="number"
              min="1"
              className="w-full bg-black border border-[#333] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              placeholder="Example: 150"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Example: 10% OFF up to ₹150.
            </p>
          </div>
        )}

        {/* Code */}
        <div>
          <label className="block text-sm mb-1">Coupon Code (optional)</label>
          <input
            type="text"
            className="w-full bg-black border border-[#333] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 tracking-widest uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="AMAN50 (optional, for display)"
          />
        </div>

        {/* Internal Note */}
        <div>
          <label className="block text-sm mb-1">Internal Note</label>
          <textarea
            rows={2}
            className="w-full bg-black border border-[#333] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Example: Loyal customer, regular visitor, birthday discount etc."
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full py-2.5 rounded-lg font-semibold text-sm transition ${
            saving
              ? "bg-gray-600 text-black cursor-not-allowed"
              : "bg-yellow-400 text-black hover:bg-yellow-300"
          }`}
        >
          {saving ? "Saving…" : "Save Coupon"}
        </button>
      </form>

      {/* HISTORY TIMELINE */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Coupon Usage History</h2>

        {!hasHistory && (
          <p className="text-sm text-gray-500">
            No coupon used yet by this customer.
          </p>
        )}
{hasHistory && (
  <div className="mt-3 space-y-4 border-l border-[#333] pl-4">
    {[...history]
      .slice()
      .sort(
        (a, b) =>
          new Date(b.appliedOn).getTime() -
          new Date(a.appliedOn).getTime()
      )
      .map((h, idx) => (
        <div key={idx} className="relative">
          <span className="absolute -left-[9px] top-2 w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.7)]" />

          <div className="bg-[#101010] border border-[#333] rounded-lg p-3">
            <p className="font-semibold text-sm">
              {h.type === "flat"
                ? `₹${h.amount} OFF`
                : `${h.amount}% OFF${
                    h.maxDiscount ? ` (Max ₹${h.maxDiscount})` : ""
                  }`}
            </p>

            {h.code && (
              <p className="text-xs text-gray-400 mt-1">
                Code: <span className="font-mono">{h.code}</span>
              </p>
            )}

            <p className="text-xs text-gray-500 mt-1">
              Used on:{" "}
              {h.appliedOn
                ? new Date(h.appliedOn).toLocaleString()
                : "Unknown date"}
            </p>

            {h.orderId && (
              <p className="text-[11px] text-yellow-400 mt-1">
                Order ID: {h.orderId}
              </p>
            )}
          </div>
        </div>
      ))}
  </div>
)}

      </div>
    </div>
  );
}
