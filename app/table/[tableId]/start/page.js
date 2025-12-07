"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StartPage() {
  const router = useRouter();
  const { tableId } = useParams();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tableInfo, setTableInfo] = useState(null);

  // 🔥 Table Info Load
  useEffect(() => {
    async function fetchTable() {
      const res = await fetch(`/api/tables/${tableId}`);
      const data = await res.json();
      if (data.success) setTableInfo(data.table);
    }
    fetchTable();
  }, [tableId]);

  // 🔥 Already logged in? -> direct menu
  useEffect(() => {
    const user = localStorage.getItem("onebite_user");
    if (user) router.push(`/table/${tableId}/menu`);
  }, [router, tableId]);

  async function handleStart(e) {
    e.preventDefault();

    if (name.trim().length < 2) return alert("Enter a valid name");
    if (phone.trim().length < 10) return alert("Enter a valid phone number");

    // 1️⃣ Create CustomerSession
    const sessionRes = await fetch("/api/customer-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, tableId }),
    });

    const sessionData = await sessionRes.json();

    if (!sessionData.success) {
      alert("Failed to start session");
      return;
    }

    // 2️⃣ Create or Update CustomerUser (MAIN USER DB)
    await fetch("/api/customer-users/create-or-update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });

    // 3️⃣ Save in LocalStorage
    const userData = {
      name,
      phone,
      tableId,
      sessionId: sessionData.sessionId,
      joinedAt: Date.now(),
    };

    localStorage.setItem("onebite_user", JSON.stringify(userData));

    // 4️⃣ Move to Menu
    router.push(`/table/${tableId}/menu`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <div className="bg-[#111] p-8 rounded-xl w-full max-w-md shadow-2xl border border-[#222]">
        
        <h1 className="text-3xl font-bold text-center text-[#FFB100]">
          Welcome to OneBite 🍕
        </h1>

        <p className="text-center mt-2 text-gray-400">
          Table:{" "}
          <span className="text-white font-semibold">
            {tableInfo?.number || "Loading..."}
          </span>
        </p>

        <form onSubmit={handleStart} className="mt-8 flex flex-col gap-4">
          
          <input
            type="text"
            placeholder="Your Name"
            className="bg-[#1c1c1c] p-3 rounded-md border border-[#333]"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="tel"
            placeholder="Phone Number"
            className="bg-[#1c1c1c] p-3 rounded-md border border-[#333]"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            type="submit"
            className="bg-[#FFB100] text-black p-3 rounded-md font-semibold hover:bg-[#ffc53e] transition"
          >
            Start Ordering 🚀
          </button>

        </form>
      </div>
    </div>
  );
}
