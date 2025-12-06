"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminItemsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const [moveItem, setMoveItem] = useState(null);

  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  }

  async function loadItems() {
    const res = await fetch("/api/items", { cache: "no-store" });
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
    loadItems();
  }, []);

  // DELETE ITEM
  async function deleteItem(id) {
    if (!confirm("Delete this item?")) return;

    await fetch(`/api/items/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i._id !== id));
  }

  // MOVE ITEM TO NEW CATEGORY
  async function updateCategory() {
    await fetch(`/api/items/${moveItem._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: moveItem.category }),
    });

    setItems([]);
    await loadItems();
    setMoveItem(null);
  }

  // FILTER + SEARCH
  const displayItems = items.filter((i) => {
    const searchMatch = i.name.toLowerCase().includes(search.toLowerCase());
    const catMatch = filterCat === "all" || i.category === filterCat;
    return searchMatch && catMatch;
  });

  return (
    <div className="p-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Menu Items</h1>

        <Link
          href="/admin/items/new"
          className="px-4 py-2 bg-[#ff6a3d] rounded-lg font-semibold hover:bg-[#ff8258]"
        >
          + Add New Item
        </Link>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#111] p-3 rounded-lg border border-gray-800 text-sm outline-none"
        />

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="bg-[#111] p-3 rounded-lg border border-gray-800 text-sm"
        >
          <option value="all">All Categories</option>

          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-lg">
          Loading items...
        </div>
      ) : displayItems.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-lg">
          No items found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayItems.map((item) => (
            <div
              key={item._id}
              className="bg-[#111] border border-gray-800 p-5 rounded-xl shadow hover:shadow-xl transition"
            >
              <div className="mb-3">
                <img
                  src={item.image}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>

              <h2 className="text-xl font-bold text-[#ff6a3d] mb-1">
                {item.name}
              </h2>

              <p className="text-gray-300 text-sm mb-1">
                Category:{" "}
                <span className="font-bold text-white">
                  {categories.find((c) => c._id === item.category)?.name}
                </span>
              </p>

              <p className="text-white font-bold text-lg mb-4">
                ₹{item.price}
              </p>

              {/* ACTIONS */}
              <div className="flex justify-between">
                <Link
                  href={`/admin/items/edit/${item._id}`}
                  className="px-3 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700"
                >
                  Edit
                </Link>

                <button
                  onClick={() => deleteItem(item._id)}
                  className="px-3 py-2 bg-red-600 rounded-lg text-sm hover:bg-red-700"
                >
                  Delete
                </button>

                <button
                  onClick={() =>
                    setMoveItem({ ...item, category: item.category })
                  }
                  className="px-3 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600"
                >
                  Move
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MOVE CATEGORY MODAL */}
      {moveItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111] p-6 rounded-xl w-80 border border-gray-700">
            <h3 className="text-lg font-bold mb-4">
              Move: {moveItem.name}
            </h3>

            <select
              className="w-full bg-[#1a1a1a] border border-gray-700 p-3 rounded-lg"
              value={moveItem.category}
              onChange={(e) =>
                setMoveItem({ ...moveItem, category: e.target.value })
              }
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex gap-3 mt-4">
              <button
                onClick={updateCategory}
                className="flex-1 bg-green-600 py-2 rounded-lg"
              >
                Save
              </button>

              <button
                onClick={() => setMoveItem(null)}
                className="flex-1 bg-gray-700 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
