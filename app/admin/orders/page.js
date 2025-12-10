// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Receipt, Timer, Trash2, ArrowRight } from "lucide-react";

// export default function AdminOrdersPage() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [deleteConfirm, setDeleteConfirm] = useState(null);

//   // -----------------------------------------------------
//   // 🔥 REALTIME REFRESH — Every 1 second
//   // -----------------------------------------------------
//   useEffect(() => {
//     loadOrders();
//     const interval = setInterval(loadOrders, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   async function loadOrders() {
//     try {
//       const res = await fetch("/api/orders/paginated?page=1&limit=30", {
//         cache: "no-store",
//       });

//       const data = await res.json();

//       if (data.orders?.length) {
//         const active = data.orders.filter((o) => o.status !== "served");
//         setOrders(active);
//       }
//     } catch (err) {
//       console.log("Fetch Error:", err);
//     }
//     setLoading(false);
//   }

//   // -----------------------------------------------------
//   // DELETE ORDER
//   // -----------------------------------------------------
//   async function deleteOrder(id) {
//     try {
//       await fetch(`/api/orders/${id}`, { method: "DELETE" });
//       setOrders((p) => p.filter((x) => x._id !== id));
//       setDeleteConfirm(null);
//     } catch (err) {
//       console.log("Delete error:", err);
//     }
//   }

//   // -----------------------------------------------------
//   // MARK ORDER AS SEEN (NEW badge remove)
//   // -----------------------------------------------------
//   async function markSeen(id) {
//     try {
//       await fetch(`/api/orders/seen/${id}`, { method: "PUT" });
//     } catch (err) {
//       console.log("Seen update failed:", err);
//     }
//   }

//   // -----------------------------------------------------
//   // STATUS COLORS
//   // -----------------------------------------------------
//   const statusColors = {
//     pending: "bg-yellow-600",
//     preparing: "bg-orange-600",
//     ready: "bg-blue-600",
//   };

//   // -----------------------------------------------------
//   // ORDER CARD UI
//   // -----------------------------------------------------
//   function OrderCard({ o }) {
//     return (
//       <div
//         onClick={() => {
//           setSelectedOrder(o);
//           if (!o.seenByAdmin) markSeen(o._id); // 👈 NEW BADGE REMOVE
//         }}
//         className={`relative bg-[#0e0e0e] border rounded-xl p-6 shadow-xl cursor-pointer 
//           transition hover:-translate-y-1 hover:border-[#ff6a3d]`}
//       >
//         {/* DELETE */}
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             setDeleteConfirm(o);
//           }}
//           className="absolute top-3 right-3 text-red-500 hover:text-red-300"
//         >
//           <Trash2 size={20} />
//         </button>

//         {/* NEW BADGE */}
//         {!o.seenByAdmin && (
//           <span className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs animate-pulse">
//             NEW
//           </span>
//         )}

//         {/* TIME */}
//         <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
//           <Timer size={14} /> {new Date(o.createdAt).toLocaleString()}
//         </p>

//         {/* TABLE */}
//         <div className="flex justify-between items-center">
//           <h2 className="text-2xl font-bold text-[#ff6a3d]">
//             {o.tableName || o.table}
//           </h2>

//           {/* STATUS BADGE */}
//           <span
//             className={`px-3 py-1 rounded-full text-xs text-white ${statusColors[o.status]}`}
//           >
//             {o.status.toUpperCase()}
//           </span>
//         </div>

//         {/* ITEMS + PRICE */}
//         <p className="text-gray-300 mt-3">{o.totalQty} items</p>
//         <p className="text-xl font-bold mt-1 text-white">₹{o.totalPrice}</p>

//         {/* BILL BUTTON */}
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             window.location.href = `/admin/orders/bill/${o._id}`;
//           }}
//           className="mt-4 w-full bg-[#ff6a3d] py-2 rounded-lg text-white text-sm flex items-center justify-center gap-2 hover:bg-[#ff7c57]"
//         >
//           <Receipt size={16} /> View Bill
//         </button>
//       </div>
//     );
//   }

//   // -----------------------------------------------------
//   // UI
//   // -----------------------------------------------------
//   return (
//     <div className="p-6 text-white">
//       <h1 className="text-4xl font-extrabold mb-2">Orders</h1>
//       <p className="text-gray-400 mb-8">Live status updates from kitchen</p>

//       {loading && <p className="text-center text-gray-400">Loading…</p>}

//       {orders.length === 0 && (
//         <p className="text-center text-gray-500 py-10 text-lg">
//           No active orders
//         </p>
//       )}

//       {/* GRID */}
//       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//         {orders.map((o) => (
//           <OrderCard key={o._id} o={o} />
//         ))}
//       </div>

//       {/* VIEW HISTORY */}
//       <div className="mt-14 flex justify-center">
//         <Link
//           href="/admin/orders/history"
//           className="px-6 py-3 rounded-xl border border-gray-700 bg-[#111] hover:bg-[#1a1a1a] text-sm font-semibold flex items-center gap-2"
//         >
//           View Full Order History <ArrowRight size={16} />
//         </Link>
//       </div>

//       {/* --------------------------------------------- */}
//       {/* ORDER DETAILS MODAL                           */}
//       {/* --------------------------------------------- */}
//       {selectedOrder && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">
//           <div className="bg-[#0f0f0f] rounded-2xl w-[90%] max-w-lg p-6 border border-[#222] shadow-xl relative">

//             <button
//               onClick={() => setSelectedOrder(null)}
//               className="absolute top-4 right-4 text-gray-400 text-2xl"
//             >
//               ×
//             </button>

//             <h2 className="text-2xl font-bold text-[#ff6a3d]">
//               {selectedOrder.tableName}
//             </h2>

//             <p className="text-xs text-gray-400 mb-3">
//               {new Date(selectedOrder.createdAt).toLocaleString()}
//             </p>

//             {/* STATUS */}
//             <span
//               className={`px-3 py-1 rounded-full text-xs text-white ${statusColors[selectedOrder.status]}`}
//             >
//               {selectedOrder.status.toUpperCase()}
//             </span>

//             {/* ITEMS */}
//             <div className="max-h-64 overflow-y-auto mt-5 space-y-3">
//               {selectedOrder.items.map((i) => (
//                 <div
//                   key={i._id}
//                   className="flex justify-between border-b border-gray-800 pb-2"
//                 >
//                   <div>
//                     <p className="font-bold">{i.name}</p>
//                     <p className="text-xs text-gray-500">
//                       {i.qty} × ₹{i.price}
//                     </p>
//                   </div>
//                   <p className="font-bold text-[#ff6a3d]">
//                     ₹{i.qty * i.price}
//                   </p>
//                 </div>
//               ))}
//             </div>

//             {/* NOTE */}
//             {selectedOrder.note && (
//               <p className="mt-4 bg-[#1a1a1a] p-3 rounded-xl text-sm text-gray-300">
//                 <span className="font-semibold">Note: </span>
//                 {selectedOrder.note}
//               </p>
//             )}

//             {/* TOTAL */}
//             <div className="flex justify-between text-xl font-bold mt-6">
//               <p>Total</p>
//               <p>₹{selectedOrder.totalPrice}</p>
//             </div>

//             {/* BILL BUTTON */}
//             <button
//               onClick={() =>
//                 (window.location.href = `/admin/orders/bill/${selectedOrder._id}`)
//               }
//               className="mt-6 w-full bg-[#ff6a3d] py-3 rounded-xl text-white text-sm font-bold hover:bg-[#ff7c57]"
//             >
//               View Bill →
//             </button>
//           </div>
//         </div>
//       )}

//       {/* DELETE MODAL */}
//       {deleteConfirm && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">
//           <div className="bg-[#0f0f0f] rounded-2xl w-[90%] max-w-sm p-6 border border-red-700/40 shadow-xl">
//             <h2 className="text-xl font-bold text-red-500 mb-3">
//               Delete Order?
//             </h2>

//             <p className="text-gray-300 mb-6">
//               Delete order from{" "}
//               <span className="font-semibold">{deleteConfirm.table}</span>?
//             </p>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => deleteOrder(deleteConfirm._id)}
//                 className="flex-1 bg-red-600 py-2 rounded-lg text-white font-semibold"
//               >
//                 Delete
//               </button>
//               <button
//                 onClick={() => setDeleteConfirm(null)}
//                 className="flex-1 bg-gray-700 py-2 rounded-lg text-white font-semibold"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
