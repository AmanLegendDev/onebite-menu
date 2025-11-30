"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col items-center justify-center px-6">

      {/* LOGO */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl sm:text-6xl font-extrabold text-center"
      >
        Digital Menu System 🍽️
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-400 mt-3 text-center text-lg max-w-md"
      >
        Fast • Modern • Real-time Ordering Experience
      </motion.p>

      {/* BUTTONS */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        
        {/* USER MENU */}
        <Link href="/menu">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="bg-[#ff6a3d] px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition"
          >
            View Menu 🍕
          </motion.button>
        </Link>

        {/* ADMIN LOGIN */}
        <Link href="/admin">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="bg-[#1f1f1f] px-6 py-3 rounded-full border border-gray-700 font-semibold hover:border-[#ff6a3d] transition"
          >
            Admin Login 🔐
          </motion.button>
        </Link>

      </div>

      {/* FOOTER */}
      <p className="mt-16 text-white font-bold text-sm">
        Built with ❤️ by Aman
      </p>
    </div>
  );
}
