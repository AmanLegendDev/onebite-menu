"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
  e.preventDefault();
  setError("");
  setLoading(true);

  // form values
  const email = e.currentTarget.email.value.trim().toLowerCase();
  const password = e.currentTarget.password.value;

  // 👉 yaha pe res chahiye, isko hataana nahi hai
  const res = await signIn("credentials", {
    redirect: false,   // hum khud redirect karenge
    email,
    password,
  });

  setLoading(false);

  // agar res hi nahi mila (edge case)
  if (!res) {
    setError("Something went wrong. Please try again.");
    return;
  }

  // ❌ wrong email / password / unauthorized
  if (res.error) {
    setError(res.error);
    return;
  }

  // ✅ success: ab hum khud admin pe bhejenge
  router.replace("/admin");
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 shadow-[0_0_20px_rgba(0,0,0,0.4)] space-y-5"
      >
        <h1 className="text-3xl font-semibold text-center mb-4 text-white">
          Admin Login
        </h1>

        {error && (
          <p className="text-red-500 text-center text-sm bg-red-500/10 py-2 rounded">
            {error}
          </p>
        )}

        <div className="space-y-1">
        <h1 className="font-bold text-center">onebite@admin.com</h1>
          <label className="text-sm text-gray-300">Email</label>
          <input
            name="email"
            type="email"
            placeholder="Enter email"
            required
            className="w-full px-3 py-2 rounded-lg bg-[#111] border border-[#333] text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition"
          />
        </div>

        <div className="space-y-1">
          <h1 className="font-bold text-center">onebiteadmin123</h1>
          <label className="text-sm text-gray-300">Password</label>
          <input
            name="password"
            type="password"
            placeholder="Enter password"
            required
            className="w-full px-3 py-2 rounded-lg bg-[#111] border border-[#333] text-white placeholder-gray-500 focus:outline-none focus:border-blue-600 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg font-medium text-white transition mt-2"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
