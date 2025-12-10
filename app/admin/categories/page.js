"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // LOAD
  async function loadCategories() {
    const res = await fetch("/api/categories", { cache: "no-store" });
    const data = await res.json();

    const sorted = [...data].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    setCategories(sorted);
  }

  useEffect(() => {
  loadCategories(); // initial

  const interval = setInterval(() => {
    loadCategories(); // auto-refresh every 2 sec
  }, 2000);

  return () => clearInterval(interval);
}, []);


  // ADD / UPDATE
  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    if (editId) {
      await fetch("/api/categories", {
        method: "PUT",
        body: JSON.stringify({ id: editId, name }),
      });
      setEditId(null);
    } else {
      await fetch("/api/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
    }

    setName("");
    await loadCategories();
  }

  // DELETE
  async function deleteCategory(id) {
    await fetch("/api/categories", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });

    setConfirmDelete(null);
    await loadCategories();
  }

  // EDIT
  function startEdit(cat) {
    setEditId(cat._id);
    setName(cat.name);
  }

  return (
    <div className="py-4 px-2 sm:px-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>
        <Link
        href="/admin"
        className="inline-block mb-4 px-4 py-2 rounded-lg bg-[#111] border border-[#222]"
      >
        ← Back
      </Link>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 mb-8"
      >
        <input
          type="text"
          placeholder="Category name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-[#111] border border-[#333] rounded px-4 py-2 flex-1 text-white"
        />

        <button
          type="submit"
          className="bg-[#ff6a3d] hover:brightness-110 transition px-6 py-2 rounded font-semibold"
        >
          {editId ? "Update" : "Add"}
        </button>
      </form>

      {/* GRID CARDS */}
      <div
        className="
          grid 
          grid-cols-2 
          sm:grid-cols-3 
          md:grid-cols-4 
          lg:grid-cols-5 
          gap-4
        "
      >
        {categories.map((cat) => (
          <div
            key={cat._id}
            className={`bg-[#111] border ${
              editId === cat._id ? "border-[#ff6a3d]" : "border-[#333]"
            } rounded-xl p-4 shadow hover:shadow-xl hover:border-[#ff6a3d] transition relative`}
          >
            {/* NAME */}
            <p className="text-lg font-bold text-white">{cat.name}</p>

            {/* SLUG */}
            <p className="text-sm text-gray-500 mb-4">/{cat.slug}</p>

            {/* ACTION BUTTONS */}
            <div className="absolute right-3 bottom-3 flex gap-3">
              <button
                onClick={() => startEdit(cat)}
                className="text-yellow-400 hover:text-yellow-200 text-sm"
              >
                Edit
              </button>

              <button
                onClick={() => setConfirmDelete(cat)}
                className="text-red-500 hover:text-red-300 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DELETE CONFIRM MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#111] w-[90%] max-w-sm rounded-xl border border-gray-700 p-6 shadow-xl">
            <h2 className="text-xl font-bold text-red-400 mb-4">
              Delete Category?
            </h2>

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{confirmDelete.name}</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => deleteCategory(confirmDelete._id)}
                className="flex-1 bg-red-600 py-2 rounded-lg text-white font-semibold"
              >
                Delete
              </button>

              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-gray-700 py-2 rounded-lg text-white font-semibold"
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
