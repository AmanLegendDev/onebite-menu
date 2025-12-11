"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Percent, IndianRupee, Calendar, Ticket, ArrowLeft, Clock } from "lucide-react";

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

  // LOAD COUPON DATA
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/customer-users/coupon?phone=${phone}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (data.success && data.coupon) {
          const c = data.coupon;

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
        }
      } catch (err) {
        console.error("Coupon load failed:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [phone]);

  // SAVE COUPON
  async function handleSave(e) {
    e.preventDefault();

    if (!amount || Number(amount) <= 0)
      return alert("Enter valid discount");

    if (type === "percent" && (!maxDiscount || Number(maxDiscount) <= 0))
      return alert("Set max discount for percentage type");

    setSaving(true);

    try {
      const res = await fetch("/api/customer-users/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          type,
          amount: Number(amount),
          maxDiscount: type === "percent" ? Number(maxDiscount) : null,
          code: code || null,
          note,
          active: true,
        }),
      });

      const data = await res.json();
      setSaving(false);

      if (!data.success) {
        alert(data.message || "Failed to save");
        return;
      }

      setCoupon(data.coupon);
      alert("Saved successfully ✔");
      router.refresh();
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="p-6 text-gray-400">Loading customer coupon…</div>
    );

  const hasHistory = history.length > 0;

  return (
    <div className="p-6 sm:p-8 text-white max-w-3xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold">Customer Coupon</h1>
          <p className="text-gray-400 text-sm">
            Create, edit & track coupon usage
          </p>
        </div>

        <Link
          href="/admin/customers"
          className="px-3 py-1.5 rounded-lg bg-[#111] border border-[#222] hover:border-yellow-400 transition text-sm"
        >
          <ArrowLeft size={16} className="inline mr-1" />
          Back
        </Link>
      </div>

      <div className="mb-4 text-gray-300 text-sm">
        Phone: <span className="font-mono text-gray-200">{phone}</span>
      </div>

      {/* ACTIVE COUPON CARD */}
      {coupon?.active ? (
        <div className="mb-6 p-5 rounded-xl bg-[#0d0d0d]/70 backdrop-blur border border-green-500/40 shadow-lg transition hover:border-green-400/60">
          <p className="uppercase text-[11px] tracking-widest text-green-400 mb-2 font-semibold">
            Active Coupon
          </p>

          <div className="text-xl font-bold flex items-center gap-2">
            {coupon.type === "flat" ? (
              <>
                <IndianRupee size={18} /> {coupon.amount} OFF
              </>
            ) : (
              <>
                <Percent size={18} /> {coupon.amount}% OFF
                {coupon.maxDiscount && (
                  <span className="text-sm text-gray-300">
                    (Max ₹{coupon.maxDiscount})
                  </span>
                )}
              </>
            )}
          </div>

          {coupon.code && (
            <p className="mt-1 text-sm text-yellow-300">Code: {coupon.code}</p>
          )}

          {coupon.note && (
            <p className="mt-2 text-xs text-gray-400">Note: {coupon.note}</p>
          )}
        </div>
      ) : (
        <div className="mb-6 p-5 rounded-xl bg-[#101010] border border-[#333]">
          <p className="text-gray-300">No active coupon for this customer.</p>
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSave}
        className="bg-[#0d0d0d]/60 backdrop-blur border border-[#222] p-6 rounded-xl shadow-xl space-y-5"
      >
        <h2 className="text-lg font-bold">Create / Update Coupon</h2>

        {/* TYPE SWITCH */}
        <div>
          <label className="block mb-1 text-sm">Coupon Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-black border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-yellow-400 outline-none"
          >
            <option value="flat">Flat (₹ off)</option>
            <option value="percent">Percentage (% off)</option>
          </select>
        </div>

        {/* AMOUNT */}
        <div>
          <label className="block mb-1 text-sm">
            {type === "flat" ? "Amount (₹)" : "Percentage (%)"}
          </label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-black border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-yellow-400 outline-none"
          />
        </div>

        {/* MAX DISCOUNT */}
        {type === "percent" && (
          <div>
            <label className="block mb-1 text-sm">Max Discount (₹)</label>
            <input
              type="number"
              min="1"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              className="w-full bg-black border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-yellow-400 outline-none"
            />
          </div>
        )}

        {/* CODE */}
        <div>
          <label className="block mb-1 text-sm">Coupon Code (optional)</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full bg-black border border-[#333] rounded-lg px-3 py-2 text-sm tracking-widest uppercase focus:border-yellow-400 outline-none"
            placeholder="AMAN50"
          />
        </div>

        {/* NOTE */}
        <div>
          <label className="block mb-1 text-sm">Internal Note</label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-black border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-yellow-400 outline-none"
            placeholder="Birthday discount, loyal customer, etc…"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`w-full py-2.5 rounded-lg text-sm font-semibold transition ${
            saving
              ? "bg-gray-600 cursor-not-allowed text-black"
              : "bg-yellow-400 text-black hover:bg-yellow-300"
          }`}
        >
          {saving ? "Saving…" : "Save Coupon"}
        </button>
      </form>

      {/* HISTORY */}
      <div className="mt-10">
        <h2 className="text-lg font-bold mb-3">Coupon Usage History</h2>

        {!hasHistory && (
          <p className="text-sm text-gray-500">No usage history yet.</p>
        )}

        {hasHistory && (
          <div className="space-y-4 border-l border-[#333] pl-5">
            {[...history]
              .sort(
                (a, b) =>
                  new Date(b.appliedOn) - new Date(a.appliedOn)
              )
              .map((h, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[10px] top-3 w-3 h-3 bg-yellow-400 rounded-full shadow" />

                  <div className="bg-[#111] border border-[#333] rounded-lg p-4">
                    <p className="font-semibold text-sm">
                      {h.type === "flat"
                        ? `₹${h.amount} OFF`
                        : `${h.amount}% OFF${
                            h.maxDiscount
                              ? ` (Max ₹${h.maxDiscount})`
                              : ""
                          }`}
                    </p>

                    {h.code && (
                      <p className="text-xs mt-1 text-gray-400">
                        Code: {h.code}
                      </p>
                    )}

                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock size={13} /> {new Date(h.appliedOn).toLocaleString()}
                    </p>

                    {h.orderId && (
                      <p className="text-xs mt-1 text-yellow-300">
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
