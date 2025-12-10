"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* ================= DELETE POPUP ================= */
function DeletePopup({ item, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#111] p-6 rounded-xl w-[90%] max-w-[360px] border border-gray-700 text-white shadow-lg">
        <h2 className="text-xl font-bold mb-4">Delete Item?</h2>

        <p className="text-gray-300 text-sm mb-6 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-white">{item.name}</span>?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 py-2 rounded-lg hover:bg-red-700 font-semibold"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 py-2 rounded-lg hover:bg-gray-600 font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= MAIN PAGE ================= */
export default function AdminItemsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const [moveItem, setMoveItem] = useState(null);
  const [deletePopup, setDeletePopup] = useState(null);

  // ================= FETCH CATEGORIES =================
  async function loadCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data.categories || []);
    } catch {
      setCategories([]);
    }
  }

  // ================= FETCH ITEMS =================
  async function loadItems() {
    try {
      const res = await fetch("/api/items", { cache: "no-store" });
      const data = await res.json();

      const itemsArray = Array.isArray(data) ? data : data.items || [];
      const normalized = itemsArray.map((item) => ({
        ...item,
        categoryId:
          typeof item.category === "object" ? item.category?._id : item.category,
      }));

      setItems(normalized);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
    loadItems();
  }, []);

  // ================= DELETE ITEM =================
  async function confirmDelete() {
    const id = deletePopup._id;

    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, deleting: true } : i))
    );

    setTimeout(async () => {
      await fetch(`/api/items/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i._id !== id));
      setDeletePopup(null);
    }, 300);
  }

  // ================= MOVE CATEGORY =================
  async function updateCategory() {
    if (!moveItem) return;

    await fetch(`/api/items/${moveItem._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: moveItem.categoryId }),
    });

    await loadItems();
    setMoveItem(null);
  }

  // ================= FILTER LOGIC =================
  const displayItems = items.filter((i) => {
    const searchMatch = i.name.toLowerCase().includes(search.toLowerCase());
    const catMatch =
      filterCat === "all" || i.categoryId?.toString() === filterCat;
    return searchMatch && catMatch;
  });

  const getCategoryName = (item) => {
    const found = categories.find((c) => c._id === item.categoryId);
    return found ? found.name : "Uncategorized";
  };

  // ================= UI START =================
  return (
    <div className="p-4 sm:p-6 text-white">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-10 gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Menu Items</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage menu items, stock & categories.
          </p>
        </div>

        <Link
          href="/admin/items/new"
          className="px-5 py-2 bg-[#ff6a3d] rounded-lg hover:bg-[#ff8258] font-semibold"
        >
          + Add New Item
        </Link>
      </div>
        <Link
        href="/admin"
        className="inline-block mb-4 px-4 py-2 rounded-lg bg-[#111] border border-[#222]"
      >
        ← Back
      </Link>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#0e0e0e] p-3 rounded-lg border border-[#222] text-sm outline-none focus:border-[#ff6a3d]"
        />

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="bg-[#0e0e0e] p-3 rounded-lg border border-[#222] text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-10 text-gray-400">Loading items...</div>
      )}

      {/* EMPTY */}
      {!loading && displayItems.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No items found.
        </div>
      )}

      {/* LIST GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
        {displayItems.map((item) => (
          <div
            key={item._id}
            className={`bg-[#0d0d0d] p-5 rounded-2xl border border-[#1c1c1c] shadow-md transition-all max-w-[350px] mx-auto w-full ${
              item.deleting ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          >
            {/* IMAGE */}
            <div className="h-40 rounded-xl overflow-hidden mb-4 bg-[#111]">
              <img
                src={item.image}
                className="w-full h-full object-cover"
                alt=""
              />
            </div>

            {/* TITLE */}
            <h2 className="text-xl font-bold text-[#ff6a3d]">{item.name}</h2>

            <p className="text-sm text-gray-400 mb-3">
              Category:{" "}
              <span className="text-white font-semibold">
                {getCategoryName(item)}
              </span>
            </p>

            {/* STOCK */}
            <div className="bg-[#101010] p-3 rounded-xl border border-[#222] mb-4">
              <p className="text-sm text-gray-300 mb-1">Stock</p>

              <h3
                className={`text-3xl font-extrabold ${
                  item.outOfStock
                    ? "text-red-500"
                    : item.stock <= item.lowStockLimit
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {item.stock}
              </h3>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={async () => {
                    await fetch(`/api/items/${item._id}/stock`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ stockChange: -5 }),
                    });
                    loadItems();
                  }}
                  className="px-3 py-1 text-sm bg-red-600 rounded-lg hover:bg-red-700"
                >
                  -5
                </button>
                <button
                  onClick={async () => {
                    await fetch(`/api/items/${item._id}/stock`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ stockChange: +5 }),
                    });
                    loadItems();
                  }}
                  className="px-3 py-1 text-sm bg-green-600 rounded-lg hover:bg-green-700"
                >
                  +5
                </button>
              </div>
            </div>

            {/* PRICE */}
            <p className="text-lg font-bold mb-4">₹{item.price}</p>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2">
              <Link
                href={`/admin/items/${item._id}/edit`}
                className="flex-1 px-3 py-2 bg-blue-600 rounded-lg text-center hover:bg-blue-700"
              >
                Edit
              </Link>

              <button
                onClick={() => setDeletePopup(item)}
                className="flex-1 px-3 py-2 bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>

              <button
                onClick={() =>
                  setMoveItem({ ...item, categoryId: item.categoryId })
                }
                className="flex-1 px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                Move
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MOVE POPUP */}
      {moveItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111] p-6 rounded-xl w-[90%] max-w-[360px] border border-gray-700 text-white">
            <h3 className="text-lg font-bold mb-3">Move Item</h3>

            <select
              className="w-full bg-[#1a1a1a] border border-gray-700 p-3 rounded-lg"
              value={moveItem.categoryId}
              onChange={(e) =>
                setMoveItem({ ...moveItem, categoryId: e.target.value })
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
                className="flex-1 bg-green-600 py-2 rounded-lg"
                onClick={updateCategory}
              >
                Save
              </button>

              <button
                className="flex-1 bg-gray-700 py-2 rounded-lg"
                onClick={() => setMoveItem(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE POPUP */}
      {deletePopup && (
        <DeletePopup
          item={deletePopup}
          onCancel={() => setDeletePopup(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
