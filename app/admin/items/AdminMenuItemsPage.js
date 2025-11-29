"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = false;


export default function AdminMenuItemsPage() {
  const [items, setItems] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const res = await fetch("/api/items", { cache: "no-store" });

    const data = await res.json();

    if (!Array.isArray(data)) return setItems([]);

    // Sort items by category
    const sorted = [...data].sort((a, b) =>
      (a.category?.name || "")
        .localeCompare(b.category?.name || "")
    );

    setItems(sorted);
  }

  useEffect(() => {
  loadItems();
  const interval = setInterval(loadItems, 2000);
  return () => clearInterval(interval);
}, []);


  async function deleteItem() {
    await fetch(`/api/items/${deleteId}`, {
      method: "DELETE",
    });

    setShowConfirm(false);
    loadItems();
  }

  // GROUP ITEMS BY CATEGORY
  const grouped = items.reduce((acc, item) => {
    const categoryName = item.category?.name || "Uncategorized";

    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(item);

    return acc;
  }, {});
  

  return (
    <div className="p-6 text-white">
      
      {/* TOP SECTION */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Items</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage items sorted by categories
          </p>
        </div>

        <Link
          href="/admin/items/new"
          className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Item
        </Link>
      </div>

      {/* CATEGORY SECTIONS */}
      <div className="space-y-10">
        {Object.keys(grouped).map((category) => (
          <div key={category}>
            
            {/* CATEGORY HEADING */}
            <h2 className="text-2xl font-semibold mb-4 text-[#ff6a3d]">
              {category}
            </h2>

            {/* ITEMS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {grouped[category].map((i) => (
                <div
                  key={i._id}
                  className="bg-[#111] rounded-xl p-4 flex gap-4 shadow-md shadow-black/40 hover:scale-[1.01] transition"
                >
                  {/* IMAGE */}
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-black border border-gray-700">
                    {i.image ? (
                      <img
                        src={i.image}
                        alt={i.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* TEXT */}
                  <div className="flex flex-col justify-between w-full">
                    <div>
                      <h2 className="text-lg font-semibold">{i.name}</h2>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {i.description}
                      </p>
                      <p className="text-gray-300 mt-1 text-sm font-medium">
                        ₹{i.price}
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-4 mt-3">
                      <Link
                        href={`/admin/items/${i._id}/edit`}
                        className="text-yellow-400 hover:text-yellow-300 text-sm"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => {
                          setDeleteId(i._id);
                          setShowConfirm(true);
                        }}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

      {/* DELETE CONFIRMATION */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#111] p-6 rounded-xl w-80 border border-gray-700 shadow-lg text-center">
            <h2 className="text-lg font-semibold mb-3">Are you sure?</h2>
            <p className="text-gray-400 text-sm mb-6">
              This item will be permanently deleted.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={deleteItem}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
