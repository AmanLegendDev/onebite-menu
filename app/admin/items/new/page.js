"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NewItemPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");

  const [stock, setStock] = useState(0);
  const [lowStockLimit, setLowStockLimit] = useState(5);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const res = await fetch("/api/categories", { cache: "no-store" });
    const data = await res.json();
    setCategories(data);
  }

  function handleImage(e) {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function addItem() {
    if (!name || !price || !category) {
      alert("Fill all required fields");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", desc);
    formData.append("category", category);
    formData.append("stock", stock);
    formData.append("lowStockLimit", lowStockLimit);
    if (image) formData.append("image", image);

    await fetch("/api/items", { method: "POST", body: formData });

    router.push("/admin/items");
  }

  return (
    <div className="p-6 text-white">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Image
          src="/onebite-2.jpg"
          width={50}
          height={50}
          alt="OneBite Logo"
          className="rounded-full border border-[#ff6a3d]"
        />
        <h1 className="text-3xl font-extrabold tracking-wide">
          Add New Menu Item
        </h1>
      </div>

      <div className="bg-[#0e0e0e] p-6 rounded-xl border border-[#1f1f1f] shadow-xl max-w-xl">

        {/* NAME */}
        <label className="font-semibold text-sm mb-1 block">Item Name *</label>
        <input
          className="p-3 w-full mb-4 bg-black border border-gray-700 rounded-lg"
          placeholder="e.g., Margherita Pizza"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* PRICE */}
        <label className="font-semibold text-sm mb-1 block">Price *</label>
        <input
          className="p-3 w-full mb-4 bg-black border border-gray-700 rounded-lg"
          placeholder="₹ Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* STOCK */}
        <label className="font-semibold text-sm mb-1 block">Initial Stock *</label>
        <input
          type="number"
          className="p-3 w-full mb-4 bg-black border border-gray-700 rounded-lg"
          placeholder="Enter stock (e.g. 30)"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        {/* LOW STOCK LIMIT */}
        <label className="font-semibold text-sm mb-1 block">Low Stock Alert *</label>
        <input
          type="number"
          className="p-3 w-full mb-4 bg-black border border-gray-700 rounded-lg"
          placeholder="Alert when stock under..."
          value={lowStockLimit}
          onChange={(e) => setLowStockLimit(e.target.value)}
        />

        {/* DESCRIPTION */}
        <label className="font-semibold text-sm mb-1 block">Description</label>
        <textarea
          className="p-3 w-full mb-4 bg-black border border-gray-700 rounded-lg min-h-[90px]"
          placeholder="Short description..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        {/* CATEGORY */}
        <label className="font-semibold text-sm mb-1 block">Category *</label>
        <select
          className="p-3 w-full mb-4 bg-black border border-gray-700 rounded-lg"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category...</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {/* IMAGE */}
        <label className="font-semibold text-sm mb-1 block">Item Image</label>
        <input
          type="file"
          onChange={handleImage}
          className="p-3 w-full mb-3 bg-black border border-gray-700 rounded-lg"
        />

        {/* PREVIEW */}
        {preview && (
          <div className="mt-3 flex justify-center">
            <img
              src={preview}
              className="w-40 h-40 object-cover rounded-lg border border-gray-700"
            />
          </div>
        )}

        {/* SUBMIT */}
        <button
          onClick={addItem}
          disabled={loading}
          className="w-full bg-[#ff6a3d] hover:bg-[#ff874f] py-3 rounded-xl font-bold mt-6"
        >
          {loading ? "Adding..." : "Add Item"}
        </button>
      </div>
    </div>
  );
}
