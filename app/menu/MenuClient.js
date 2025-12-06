"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MenuClient({ categories, items, activeCategoryId, tableInfo }) {
  const router = useRouter();
  const tabsRef = useRef(null);

  const { cart, addToCart, increaseQty, decreaseQty } = useCart();

  const [liveCategories] = useState(categories);
  const [liveItems, setLiveItems] = useState(items);

  const [selected, setSelected] = useState({});
  const [recentOrder, setRecentOrder] = useState(null);

  const [customer, setCustomer] = useState(null);

useEffect(() => {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem("onebite_user");
  if (saved) setCustomer(JSON.parse(saved));
}, []);


  const activeCat = activeCategoryId || categories[0]?._id;

  const getCategoryCount = (catId) => {
    return cart
      .filter(
        (item) =>
          String(item.category) === String(catId) ||
          String(item.category?._id) === String(catId)
      )
      .reduce((sum, item) => sum + item.qty, 0);
  };


    // Save table info when QR menu is opened
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (tableInfo && tableInfo.id) {
      const safe = {
        id: tableInfo.id,
        name: tableInfo.name,
        number: tableInfo.number,
      };

      sessionStorage.setItem("tableInfo", JSON.stringify(safe));
    }
  }, [tableInfo]);


  useEffect(() => {
    const saved = localStorage.getItem("latestOrder");
    if (saved) setRecentOrder(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const updated = {};
    cart.forEach((item) => (updated[item._id] = item.qty));
    setSelected(updated);
  }, [cart]);

  useEffect(() => {
    setLiveItems(items);
  }, [items]);

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const visibleCategories = liveCategories.filter(
    (cat) => String(cat._id) === String(activeCat)
  );

  useEffect(() => {
    const saved = sessionStorage.getItem("tabsScroll");
    if (saved && tabsRef.current) {
      tabsRef.current.scrollLeft = Number(saved);
    }
  }, [activeCategoryId]);

  return (
    <div className="min-h-screen bg-[#0d0d0d] px-5 py-8 pb-28">

      {/* HEADER */}
      <h1 className="text-4xl font-extrabold text-yellow-400 mb-6 tracking-wide">
        ONEBITE Menu 🍕
      </h1>
      {customer && (
  <p className="text-gray-300 text-sm mb-4">
    👤 {customer.name} • 📱 {customer.phone}
  </p>
)}


      {/* CATEGORY TABS */}
      <div
        ref={tabsRef}
        className="flex gap-3 overflow-x-auto no-scrollbar pb-4 sticky top-0 bg-[#0d0d0d] z-10 pt-2"
      >
        {liveCategories.map((cat) => (
          <motion.button
            key={cat._id}
            onClick={() => {
              const savedScroll = tabsRef.current?.scrollLeft || 0;
              sessionStorage.setItem("tabsScroll", savedScroll);

              router.push(`/menu/${String(cat._id)}`);
            }}
            whileTap={{ scale: 0.9 }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all
              ${
                String(activeCat) === String(cat._id)
                  ? "bg-yellow-400 text-black shadow-lg"
                  : "bg-[#1a1a1a] text-gray-300 border border-gray-600 hover:border-yellow-400"
              }`}
          >
            {cat.name}
            {getCategoryCount(cat._id) > 0 && (
              <span className="ml-1 text-xs">({getCategoryCount(cat._id)})</span>
            )}
          </motion.button>
        ))}
      </div>

      {/* LAST ORDER */}
      {recentOrder && (
        <div className="w-full bg-[#1a1a1a] rounded-lg shadow-lg border border-yellow-400 px-5 py-3 flex justify-between items-center mt-4">
          <p className="font-semibold text-yellow-300">
            Last order • Table {recentOrder.table}
          </p>
          <button
            onClick={() => router.push("/order-success")}
            className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-semibold"
          >
            View
          </button>
        </div>
      )}

      {/* ITEMS GRID */}
      <div className="mt-8 space-y-16">
        {visibleCategories.map((cat) => (
          <section key={cat._id}>
            <h2 className="text-3xl font-bold text-white mb-4 tracking-wide">
              {cat.name}{" "}
              {getCategoryCount(cat._id) > 0 &&
                `(${getCategoryCount(cat._id)})`}
            </h2>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
            >
              {liveItems
                .filter(
                  (item) =>
                    String(item.category) === String(cat._id) ||
                    String(item.category?._id) === String(cat._id)
                )
                .map((item) => {
                  const inCart = cart.find((c) => c._id === item._id);
                  const qty = inCart?.qty ?? 0;
                  const isSelected = selected[item._id] > 0;

                  return (
                    <motion.div
                      key={item._id}
                      whileHover={{ scale: 1.03 }}
                      className="bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-700 hover:border-yellow-400 overflow-hidden flex flex-col"
                    >
                      {/* IMAGE */}
                      <div className="h-40 w-full overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={500}
                          height={300}
                          priority
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-lg font-bold text-white line-clamp-2 min-h-[48px]">
                          {item.name}
                        </h3>

                        <p className="text-gray-400 text-sm mt-1 min-h-[40px] line-clamp-2">
                          {item.description}
                        </p>

                        {/* QTY CONTROL */}
                        <div className="flex items-center justify-center gap-4 mt-4">
                          <button
                            onClick={() => decreaseQty(item._id)}
                            className="bg-[#333] text-white w-9 h-9 flex items-center justify-center rounded-full text-lg font-bold hover:bg-[#444]"
                          >
                            -
                          </button>

                          <span className="text-lg font-semibold text-yellow-400 w-6 text-center">
                            {qty}
                          </span>

                          <button
                            onClick={() => {
                              qty === 0 ? addToCart(item) : increaseQty(item._id);
                            }}
                            className="bg-yellow-400 text-black w-9 h-9 flex items-center justify-center rounded-full text-lg font-bold"
                          >
                            +
                          </button>
                        </div>

                        {/* PRICE + SELECT BUTTON */}
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-yellow-400 font-bold text-lg">
                            ₹{item.price}
                          </p>

                          {isSelected ? (
                            <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-green-500 text-black">
                              Selected ({selected[item._id]})
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
                              className={`px-4 py-1.5 rounded-full text-xs font-semibold 
                                ${
                                  qty < 1
                                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                    : "bg-yellow-400 text-black"
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

      {/* CART FOOTER */}
      {totalQty > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-[#1a1a1a] border-t border-yellow-400 shadow-xl px-5 py-4 flex justify-between items-center z-50">
          <p className="font-semibold text-yellow-300 text-lg">
            {totalQty} items • ₹{totalPrice}
          </p>
          <button
            onClick={() => router.push("/order-review")}
            className="bg-yellow-400 text-black px-6 py-2 rounded-full font-bold hover:bg-yellow-300 transition"
          >
            Proceed →
          </button>
        </div>
      )}
    </div>
  );
}
