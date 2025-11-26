"use client";

import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [editId, setEditId] = useState(null);

  // ------------------------ FETCH ALL CATEGORIES ------------------------
  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  // ------------------------ ADD OR UPDATE CATEGORY ------------------------
  async function handleSubmit(e) {
    e.preventDefault();

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
    loadCategories();
  }

  // ------------------------ DELETE CATEGORY ------------------------
  async function deleteCategory(id) {
    await fetch("/api/categories", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });

    loadCategories();
  }

  // ------------------------ ENABLE EDIT MODE ------------------------
  function startEdit(cat) {
    setEditId(cat._id);
    setName(cat.name);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Categories</h1>

      {/* ADD / EDIT CATEGORY FORM */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="Category name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-[#111] border border-[#333] rounded px-4 py-2"
        />
        <button className="bg-blue-600 px-4 py-2 rounded" type="submit">
          {editId ? "Update" : "Add"}
        </button>
      </form>

      {/* LIST OF CATEGORIES */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="flex justify-between items-center bg-[#111] px-4 py-3 rounded border border-[#333]"
          >
            <div>
              <p className="text-lg">{cat.name}</p>
              <p className="text-gray-500 text-sm">/{cat.slug}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => startEdit(cat)}
                className="text-yellow-400"
              >
                Edit
              </button>

              <button
                onClick={() => deleteCategory(cat._id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
