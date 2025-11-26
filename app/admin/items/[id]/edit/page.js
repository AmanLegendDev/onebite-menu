"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditItemPage({ params }) {
  const router = useRouter();

  // states
  const [item, setItem] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [newImage, setNewImage] = useState(null);

  const [categories, setCategories] = useState([]);

  // load categories + item
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
    const res = await fetch(`/api/items/${params.id}`);
    const data = await res.json();

    setItem(data);
    setName(data.name);
    setPrice(data.price);
    setDesc(data.description);
    setCategory(data.category?._id);
    setImagePreview(data.image);
  }

  async function updateItem() {
    const form = new FormData();
    form.append("name", name);
    form.append("price", price);
    form.append("description", desc);
    form.append("category", category);

    if (newImage) form.append("image", newImage);

    await fetch(`/api/items/${params.id}`, {
      method: "PUT",
      body: form,
    });

    router.push("/admin/items");
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Edit Item</h1>

      {item && (
        <div className="bg-[#111] p-5 rounded">

          <input
            className="p-2 w-full mb-3 bg-black border border-gray-700 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="p-2 w-full mb-3 bg-black border border-gray-700 rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <textarea
            className="p-2 w-full mb-3 bg-black border border-gray-700 rounded"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <select
            className="p-2 w-full mb-3 bg-black border border-gray-700 rounded"
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
          {imagePreview && (
            <img
              src={imagePreview}
              className="w-24 h-24 mb-3 rounded-lg border border-gray-700 object-cover"
            />
          )}

          {/* NEW IMAGE */}
          <input
            type="file"
            className="p-2 w-full mb-3 bg-black border border-gray-700 rounded"
            onChange={(e) => setNewImage(e.target.files[0])}
          />

          <button
            onClick={updateItem}
            className="bg-blue-600 px-4 py-2 rounded mt-4"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}
