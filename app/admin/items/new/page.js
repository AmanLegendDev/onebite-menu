"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewItemPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null); // NEW

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  }

  async function addItem() {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", desc);
    formData.append("category", category);
    formData.append("image", image); // NEW file

    await fetch("/api/items", {
      method: "POST",
      body: formData,
    });

    router.push("/admin/items");
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Add New Item</h1>

      <div className="bg-[#111] p-5 rounded">

        <input
          className="p-2 w-full mb-3 bg-black border border-gray-700 rounded"
          placeholder="Item name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="p-2 w-full mb-3 bg-black border border-gray-700 rounded"
          placeholder="Price..."
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <textarea
          className="p-2 w-full mb-3 bg-black border border-gray-700 rounded"
          placeholder="Description..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <select
          className="p-2 w-full mb-3 bg-black border border-gray-700 rounded"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category...</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* IMAGE INPUT */}
        <input
          type="file"
          className="p-2 w-full mb-3 bg-black border border-gray-700 rounded"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button
          onClick={addItem}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Add Item
        </button>
      </div>
    </div>
  );
}
