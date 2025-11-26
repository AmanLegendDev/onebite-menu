"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";

export default function MenuPage() {
  const router = useRouter()
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [selected, setSelected] = useState({}); // { itemId: qty }

  const { cart, addToCart, increaseQty, decreaseQty } = useCart();
  const [recentOrder, setRecentOrder] = useState(null);

useEffect(() => {
  const saved = localStorage.getItem("latestOrder");
  if (saved) setRecentOrder(JSON.parse(saved));
}, []);


  useEffect(() => {
    loadCategories();
    loadItems();
  }, []);

  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
    if (data.length > 0) setActiveCat(data[0]._id);
  }

  async function loadItems() {
    const res = await fetch("/api/items");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  }

  // AUTO-UPDATE selected qty whenever cart qty changes
  useEffect(() => {
    const updated = {};
    cart.forEach((item) => {
      updated[item._id] = item.qty;
    });
    setSelected(updated);
  }, [cart]);

  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <div className="min-h-screen bg-[#f8f8f8] px-5 py-8 pb-24">
      

      <h1 className="text-4xl font-extrabold text-[#111] mb-6">Menu</h1>

      {/* CATEGORY TABS */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 sticky top-0 bg-[#f8f8f8] z-10 pt-2">
        {categories.map((cat) => (
          <motion.button
            key={cat._id}
            onClick={() => {
              setActiveCat(cat._id);
              document.getElementById(`cat-${cat._id}`)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            whileTap={{ scale: 0.9 }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition 
              ${
                activeCat === cat._id
                  ? "bg-[#ff6a3d] text-white shadow-md"
                  : "bg-white text-[#333] border border-gray-300"
              }`}
          >
            {cat.name}
          </motion.button>
        ))}
      </div>
      <div>
        {recentOrder && (
  <div className=" w-full bg-white shadow-lg border-b px-5 py-3 flex justify-between items-center z-50">
    <p className="font-semibold text-[#111]">
      Last order • Table {recentOrder.table}
    </p>

    <button
      onClick={() => router.push("/order-success")}
      className="bg-[#ff6a3d] text-white px-4 py-2 rounded-full text-sm font-semibold"
    >
      View
    </button>
  </div>
)}

      </div>

      <div className="mt-6 space-y-14">

        {categories.map((cat) => (
          <section id={`cat-${cat._id}`} key={cat._id}>
            
            <h2 className="text-3xl font-bold text-[#111] mb-5">{cat.name}</h2>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
            >

              {items
                .filter((item) => item.category?._id === cat._id)
                .map((item) => {

                  const inCart = cart.find((c) => c._id === item._id);
                  const qty = inCart?.qty ?? 0;

                  const isSelected = selected[item._id] > 0;

                  return (
                    <motion.div
                      key={item._id}
                      whileHover={{ scale: 1.03 }}
                      className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col"
                    >
                      
                      {/* IMAGE */}
                      <div className="h-36 w-full overflow-hidden rounded-t-xl">
                        <img
                          src={item.image}
                          className="w-full h-full object-cover"
                          alt={item.name}
                        />
                      </div>

                      <div className="p-3 flex flex-col flex-grow">

                        <h3 className="text-lg font-semibold text-[#111] line-clamp-2 min-h-[48px]">
                          {item.name}
                        </h3>

                        <p className="text-gray-500 text-sm mt-1 line-clamp-2 min-h-[40px]">
                          {item.description}
                        </p>

                        {/* QUANTITY CENTER ALWAYS SHOW */}
                        <div className="flex items-center justify-center gap-3 mt-4">

                          {/* - */}
                          <button
                            onClick={() => decreaseQty(item._id)}
                            className="bg-gray-200 text-[#111] w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold"
                          >
                            -
                          </button>

                          {/* QTY ALWAYS SHOW EVEN IF ZERO */}
                          <span className="text-lg font-semibold w-6 text-center text-black">
                            {qty}
                          </span>

                          {/* + */}
                          <button
                            onClick={() => {
                              if (qty === 0) addToCart(item);
                              else increaseQty(item._id);
                            }}
                            className="bg-[#ff6a3d] text-white w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold"
                          >
                            +
                          </button>

                        </div>

                        {/* PRICE + SELECT */}
                        <div className="flex items-center justify-between mt-4">

                          <p className="text-[#ff6a3d] font-bold text-lg">
                            ₹{item.price}
                          </p>

                          {/* SELECTED BUTTON */}
                          {isSelected ? (
                            <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-green-500 text-white flex justify-between">
                              Selected <h1>({selected[item._id]})</h1>
                            </button>
                          ) : (
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                if (qty < 1) {
                                  alert("Please select at least 1 quantity.");
                                  return;
                                }
                                setSelected((prev) => ({
                                  ...prev,
                                  [item._id]: qty,
                                }));
                              }}
                              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition
                                ${
                                  qty < 1
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-[#ff6a3d] text-white"
                                }`}
                            >
                              Select
                            </motion.button>
                          )}

                        </div>

                      </div>

                    </motion.div>
                  );
                })}

            </motion.div>

          </section>
        ))}

      </div>

      {/* STICKY BAR */}
      {totalQty > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg border-t border-gray-300 px-5 py-3 flex justify-between items-center z-50">
          
          <p className="font-semibold text-[#111]">
            {totalQty} items • ₹{totalPrice}
          </p>

          <button
            className="bg-[#ff6a3d] text-white px-6 py-2 rounded-full font-semibold"
            onClick={() => router.push("/order-review")}
          >
            process
          </button>

        </div>
      )}

    </div>
  );
}
