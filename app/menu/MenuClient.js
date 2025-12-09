"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MenuClient({
  categories,
  items,
  activeCategoryId,
  tableInfo,
}) {
  const router = useRouter();
  const tabsRef = useRef(null);

  const { cart, addToCart, increaseQty, decreaseQty } = useCart();

  const [liveCategories] = useState(categories);
  const [liveItems, setLiveItems] = useState(items);

  const [selected, setSelected] = useState({});
  const [recentOrder, setRecentOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [localTableInfo, setLocalTableInfo] = useState(tableInfo);

  // Load customer (name + phone) from localStorage
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
    if (localTableInfo && localTableInfo.id) {
      const safe = {
        id: localTableInfo.id,
        name: localTableInfo.name,
        number: localTableInfo.number,
      };

      sessionStorage.setItem("tableInfo", JSON.stringify(safe));
    }
  }, [localTableInfo]);

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

  // Visible categories limited to active
  const visibleCategories = liveCategories.filter(
    (cat) => String(cat._id) === String(activeCat)
  );

  useEffect(() => {
    const saved = sessionStorage.getItem("tabsScroll");
    if (saved && tabsRef.current) {
      tabsRef.current.scrollLeft = Number(saved);
    }
  }, [activeCategoryId]);

  const tableLabel =
    localTableInfo?.name ||
    (localTableInfo?.number ? `Table ${localTableInfo.number}` : "Unrecognized Table");

  // ALWAYS restore table info even on category change
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedTable = sessionStorage.getItem("tableInfo");
    if (savedTable) {
      try {
        const parsed = JSON.parse(savedTable);

        // FORCE SET tableInfo INTO STATE
        setLocalTableInfo(parsed);
      } catch (e) {}
    }
  }, []);

  // Helper: get qty in cart for an item
  const getCartQty = (itemId) => {
    const inCart = cart.find((c) => c._id === itemId);
    return inCart?.qty ?? 0;
  };

  // Helper: check if we can add more of item based on stock
  const canAddMore = (item) => {
    if (item.outOfStock) return false;
    if (typeof item.stock !== "number") return true; // unlimited or not set
    const current = getCartQty(item._id);
    return current < Number(item.stock);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-28">
      {/* TOP GRADIENT + HEADER + TABS */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#050505] via-[#050505] to-[#050505]/95 backdrop-blur-md border-b border-yellow-500/10 px-5 pt-4 pb-3">
        {/* HEADER BAR */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Logo */}
          <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden border border-yellow-400/80 shadow-[0_0_20px_rgba(248,197,55,0.4)] bg-black">
            <Image
              src="/onebite.jpeg"
              alt="OneBite Logo"
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>

          {/* Title + Info */}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              <span className="text-yellow-400">ONEBITE</span>{" "}
              <span className="text-white">Menu</span> <span>🍕</span>
            </h1>

            {/* Customer + table line */}
            {(customer || localTableInfo) && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-gray-300">
                {customer && (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#151515] text-[10px]">
                        👤
                      </span>
                      <span className="font-medium">{customer.name}</span>
                    </span>
                    <span className="h-1 w-1 rounded-full bg-gray-500" />
                    <span className="font-mono text-gray-400">
                      📱 {customer.phone}
                    </span>
                  </>
                )}

                {tableLabel && (
                  <>
                    {customer && (
                      <span className="h-1 w-1 rounded-full bg-gray-500" />
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/70 bg-yellow-400/10 px-3 py-1 font-semibold text-[11px] text-yellow-300">
                      🪑 {tableLabel}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div
          ref={tabsRef}
          className="mt-4 flex gap-3 overflow-x-auto no-scrollbar pb-1"
        >
          {liveCategories.map((cat) => {
            const isActive = String(activeCat) === String(cat._id);
            const count = getCategoryCount(cat._id);

            return (
              <motion.button
                key={cat._id}
                onClick={() => {
                  const savedScroll = tabsRef.current?.scrollLeft || 0;
                  sessionStorage.setItem("tabsScroll", savedScroll);

                  router.push(`/menu/${String(cat._id)}`);
                }}
                whileTap={{ scale: 0.9 }}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all border backdrop-blur
                  ${
                    isActive
                      ? "bg-yellow-400 text-black border-yellow-400 shadow-[0_0_18px_rgba(248,197,55,0.7)]"
                      : "bg-[#111111] text-gray-200 border-[#333333] hover:border-yellow-400/70 hover:text-yellow-200"
                  }`}
              >
                {cat.name}
                {count > 0 && (
                  <span className="ml-1 text-[11px] sm:text-xs opacity-90">
                    ({count})
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="px-5 pt-4">
        {/* LAST ORDER BANNER */}
        {recentOrder && (
          <div className="w-full bg-[#111111] rounded-2xl shadow-lg border border-yellow-500/40 px-5 py-3 flex justify-between items-center mt-2">
            <div>
              <p className="font-semibold text-yellow-300 text-sm sm:text-base">
                Last order •{" "}
                {recentOrder.tableName || recentOrder.table || "Table"}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Tap to view your previous bill
              </p>
            </div>

            <button
              onClick={() => router.push("/order-success")}
              className="bg-yellow-400 text-black px-4 py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-yellow-300 transition shadow-md"
            >
              View
            </button>
          </div>
        )}

        {/* ITEMS GRID */}
        <div className="mt-8 space-y-16">
          {visibleCategories.map((cat) => (
            <section key={cat._id}>
              <div className="flex items-baseline justify-between gap-2 mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">
                  {cat.name}{" "}
                  {getCategoryCount(cat._id) > 0 && `(${getCategoryCount(cat._id)})`}
                </h2>
              </div>

              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                viewport={{ once: true }}
              >
                {liveItems
                  .filter(
                    (item) =>
                      // same category
                      (String(item.category) === String(cat._id) ||
                        String(item.category?._id) === String(cat._id)) &&
                      // HIDE out of stock items from customer view
                      !item.outOfStock
                  )
                  .map((item) => {
                    const inCart = cart.find((c) => c._id === item._id);
                    const qty = inCart?.qty ?? 0;
                    const isSelected = selected[item._id] > 0;

                    // Stock label logic
                    const stockNum =
                      typeof item.stock === "number" ? Number(item.stock) : null;
                    const lowLimit =
                      typeof item.lowStockLimit === "number"
                        ? Number(item.lowStockLimit)
                        : 5;

                    let stockBadge = null;
                    if (item.outOfStock) {
                      stockBadge = (
                        <span className="text-red-400 text-xs font-semibold">
                          Out of stock
                        </span>
                      );
                    } else if (stockNum !== null && stockNum <= lowLimit) {
                      stockBadge = (
                        <span className="text-yellow-400 text-xs font-semibold">
                          Only {stockNum} left
                        </span>
                      );
                    } else {
                      stockBadge = (
                        <span className="text-green-400 text-xs font-semibold">
                          In stock
                        </span>
                      );
                    }

                    const addDisabled = !canAddMore(item);

                    return (
                      <motion.div
                        key={item._id}
                        whileHover={{ scale: 1.03 }}
                        className="bg-[#111111] rounded-2xl shadow-lg border border-[#333333] hover:border-yellow-400/80 overflow-hidden flex flex-col"
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
                          <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2 min-h-[44px]">
                            {item.name}
                          </h3>

                          <p className="text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2 overflow-hidden">
                            {item.description}
                          </p>

                          {/* STOCK BADGE */}
                          <div className="mt-2">{stockBadge}</div>

                          {/* QTY CONTROL */}
                          <div className="flex items-center justify-center gap-4 mt-4">
                            <button
                              onClick={() => decreaseQty(item._id)}
                              className="bg-[#2a2a2a] text-white w-9 h-9 flex items-center justify-center rounded-full text-lg font-bold hover:bg-[#3a3a3a]"
                            >
                              -
                            </button>

                            <span className="text-lg font-semibold text-yellow-400 w-6 text-center">
                              {qty}
                            </span>

                            <button
                              onClick={() => {
                                // Prevent adding beyond stock
                                if (addDisabled) {
                                  alert("Stock limit reached.");
                                  return;
                                }
                                qty === 0 ? addToCart(item) : increaseQty(item._id);
                              }}
                              className={`w-9 h-9 flex items-center justify-center rounded-full text-lg font-bold ${
                                addDisabled
                                  ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                                  : "bg-yellow-400 text-black hover:bg-yellow-300"
                              }`}
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
                              <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-green-500 text-black shadow-sm">
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
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition
                                  ${
                                    qty < 1
                                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                      : "bg-yellow-400 text-black hover:bg-yellow-300"
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
      </div>

      {/* CART FOOTER */}
      {totalQty > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-[#090909]/95 backdrop-blur-lg border-t border-yellow-500/40 shadow-[0_-4px_25px_rgba(0,0,0,0.8)] px-5 py-4 flex justify-between items-center z-30">
          <p className="font-semibold text-yellow-200 text-base sm:text-lg">
            {totalQty} items • ₹{totalPrice}
          </p>
          <button
            onClick={() => {
              router.push("/order-review");
            }}
            className={
              "px-6 sm:px-8 py-2.5 rounded-full font-bold transition bg-yellow-400 text-black hover:bg-yellow-300 active:scale-95"
            }
          >
            Proceed →
          </button>
        </div>
      )}
    </div>
  );
}