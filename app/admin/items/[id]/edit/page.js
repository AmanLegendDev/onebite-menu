"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditItemPage({ params }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [item, setItem] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [newImage, setNewImage] = useState(null);

  const [categories, setCategories] = useState([]);

  // LOAD DATA
  useEffect(() => {
    loadCategories();
    loadItem();
  }, []);

  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  }

  async function loadItem() {
    try {
      const res = await fetch(`/api/items/${params.id}`, { cache: "no-store" });
      const data = await res.json();

      setItem(data);
      setName(data.name);
      setPrice(data.price);
      setDesc(data.description);
      setCategory(data?.category?._id);
      setImagePreview(data.image);

      setLoading(false);
    } catch (err) {
      alert("Failed to load item");
    }
  }

  // UPDATE ITEM
  async function updateItem() {
    if (!name.trim()) return alert("Item name required");
    if (!price || price <= 0) return alert("Price must be positive");

    setSaving(true);

    const form = new FormData();
    form.append("name", name);
    form.append("price", price);
    form.append("description", desc);
    form.append("category", category);
    if (newImage) form.append("image", newImage);

    try {
      const res = await fetch(`/api/items/${params.id}`, {
        method: "PUT",
        body: form,
      });

      const data = await res.json();
      if (!data.success) {
        alert("Update failed");
        setSaving(false);
        return;
      }

      router.push("/admin/items");
    } catch (err) {
      alert("Something went wrong");
    }

    setSaving(false);
  }

  if (loading)
    return (
      <div className="p-10 text-gray-400 text-xl text-center">
        Loading item...
      </div>
    );

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Edit Item</h1>

      <div className="bg-[#111] p-6 rounded-lg border border-gray-800">

        {/* NAME */}
        <label className="text-sm text-gray-300">Item Name</label>
        <input
          className="p-3 w-full mb-4 bg-black border border-gray-700 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* PRICE */}
        <label className="text-sm text-gray-300">Price</label>
        <input
          className="p-3 w-full mb-4 bg-black border border-gray-700 rounded"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* DESC */}
        <label className="text-sm text-gray-300">Description</label>
        <textarea
          className="p-3 w-full mb-4 bg-black border border-gray-700 rounded"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        {/* CATEGORY */}
        <label className="text-sm text-gray-300">Category</label>
        <select
          className="p-3 w-full mb-4 bg-black border border-gray-700 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option value={c._id} key={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* OLD IMAGE */}
        <label className="text-sm text-gray-300">Current Image</label>
        <img
          src={imagePreview}
          className="w-28 h-28 mb-4 rounded-lg border border-gray-700 object-cover"
        />

        {/* NEW IMAGE */}
        <label className="text-sm text-gray-300">Upload New Image</label>
        <input
          type="file"
          className="p-3 w-full mb-4 bg-black border border-gray-700 rounded"
          onChange={(e) => setNewImage(e.target.files[0])}
        />

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 mt-5">
          <button
            onClick={updateItem}
            disabled={saving}
            className="bg-blue-600 px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-900"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            onClick={() => router.push("/admin/items")}
            className="bg-gray-700 px-5 py-3 rounded-lg font-semibold hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
