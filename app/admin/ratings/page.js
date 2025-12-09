"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export default function AdminRatingsPage() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadRatings() {
    try {
      const res = await fetch("/api/rating/list", { cache: "no-store" });
      const data = await res.json();
      setRatings(data.ratings || []);
    } catch (err) {
      console.log("Ratings load error:", err);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadRatings();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-400 mt-20 text-lg">
        Loading ratings…
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-4xl font-extrabold mb-2 tracking-wide text-yellow-300">
        Customer Ratings ⭐
      </h1>

      <p className="text-gray-400 mb-8">
        See what customers rated your restaurant.
      </p>

      {/* RATINGS LIST */}
      <div className="space-y-5">
        {ratings.length === 0 ? (
          <p className="text-gray-500 text-center text-lg">
            No ratings yet…
          </p>
        ) : (
          ratings.map((r) => (
            <div
              key={r._id}
              className="bg-[#111] p-5 rounded-xl border border-[#222] shadow-md hover:border-yellow-400/40 transition"
            >
              <div className="flex justify-between items-center mb-3">
                {/* STARS */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={20}
                      className={
                        s <= r.stars ? "text-yellow-400" : "text-gray-700"
                      }
                      fill={s <= r.stars ? "yellow" : "none"}
                    />
                  ))}
                </div>

                <p className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>

              {/* USER INFO */}
              <div className="text-sm text-gray-300 space-y-1">
                <p>
                  <span className="text-gray-500">Name:</span>{" "}
                  {r.customerName || "Unknown"}
                </p>
                <p>
                  <span className="text-gray-500">Phone:</span>{" "}
                  {r.customerPhone || "—"}
                </p>
                <p>
                  <span className="text-gray-500">Order ID:</span>{" "}
                  <span className="text-yellow-400">{r.orderId}</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
