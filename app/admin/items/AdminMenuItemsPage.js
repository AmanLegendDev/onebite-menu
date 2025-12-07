"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ================= DELETE POPUP =================
function DeletePopup({ item, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#111] p-6 rounded-xl w-[90%] max-w-[350px] border border-gray-700 text-white">
        <h2 className="text-lg font-bold mb-4">Delete Item?</h2>
        <p className="mb-4 text-gray-300">
          Are you sure you want to delete <b>{item.name}</b>?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 py-2 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>

          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 py-2 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= MAIN PAGE =================
export default function AdminItemsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const [moveItem, setMoveItem] = useState(null);
  const [deletePopup, setDeletePopup] = useState(null);

  // LOAD CATEGORIES
  async function loadCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data.categories || []);
    } catch {
      setCategories([]);
    }
  }

  // LOAD ITEMS
  async function loadItems() {
    try {
      const res = await fetch("/api/items", { cache: "no-store" });
      const data = await res.json();

      const itemsArray = Array.isArray(data) ? data : data.items || [];

      const normalized = itemsArray.map((item) => ({
        ...item,
        categoryId:
          typeof item.category === "object"
            ? item.category?._id
            : item.category || "",
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

  // DELETE
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

  // MOVE CATEGORY
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

  // FILTER ITEMS
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

  return (
    <div className="p-4 sm:p-6 text-white">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Menu Items
        </h1>

        <Link
          href="/admin/items/new"
          className="px-4 py-2 bg-[#ff6a3d] rounded-lg font-semibold hover:bg-[#ff8258] text-center"
        >
          + Add New Item
        </Link>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayItems.map((item) => (
            <div
              key={item._id}
              className={`bg-[#111] 
                border border-gray-800 
                p-5 rounded-xl shadow 
                transition-all duration-300 flex flex-col
                max-w-[320px] mx-auto w-full
                ${
                  item.deleting
                    ? "opacity-0 scale-75"
                    : "opacity-100 scale-100"
                }
              `}
            >
              <img
                src={item.image}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />

              <h2 className="text-xl font-bold text-[#ff6a3d] mb-1">
                {item.name}
              </h2>

              <p className="text-gray-300 text-sm mb-1">
                Category:{" "}
                <span className="font-bold text-white">
                  {getCategoryName(item)}
                </span>
              </p>

              <p className="text-white font-bold text-lg mb-4">
                ₹{item.price}
              </p>

              {/* ACTIONS */}
              <div className="flex justify-between items-center mt-auto gap-2">
                <Link
                  href={`/admin/items/${item._id}/edit`}
                  className="flex-1 text-center px-3 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  Edit
                </Link>

                <button
                  onClick={() => setDeletePopup(item)}
                  className="flex-1 px-3 py-2 bg-red-600 rounded-lg text-sm hover:bg-red-700 transition"
                >
                  Delete
                </button>

                <button
                  onClick={() =>
                    setMoveItem({
                      ...item,
                      categoryId: item.categoryId,
                    })
                  }
                  className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 transition"
                >
                  Move
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MOVE POPUP */}
      {moveItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#111] p-6 rounded-xl w-[90%] max-w-[350px] border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Move: {moveItem.name}</h3>

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
