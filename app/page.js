"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col items-center justify-center px-6">

      {/* LOGO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col items-center"
      >
        <Image
          src="/onebite-2.jpg"
          alt="OneBite Logo"
          width={160}
          height={160}
          className="rounded-full shadow-lg shadow-[#ffb10033]"
        />

        <h1 className="text-4xl sm:text-6xl font-extrabold text-center mt-4">
          <span className="text-[#FFB100]">ONE</span>BITE Menu
        </h1>

        <p className="text-gray-400 mt-2 text-center text-lg max-w-md">
          Taste • Speed • Digital Ordering Experience
        </p>
      </motion.div>

      {/* BUTTONS */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4">

        {/* USER MENU */}
        <Link href="/menu">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="bg-[#FFB100] text-black px-8 py-3 rounded-full font-semibold 
            shadow-[0_0_15px_#ffb10055] hover:shadow-[0_0_25px_#ffb100aa] transition"
          >
            View Menu 🍕
          </motion.button>
        </Link>

        {/* ADMIN LOGIN */}
        <Link href="/admin">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="bg-[#141414] px-8 py-3 rounded-full font-semibold 
            border border-[#2a2a2a] text-white 
            hover:border-[#FFB100] hover:text-[#FFB100] transition"
          >
            Admin Login 🔐
          </motion.button>
        </Link>
      </div>

      {/* FOOTER */}
      <p className="mt-14 text-gray-500 text-sm">
        © Built with ❤️ for <span className="text-[#FFB100]">OneBite</span> by <span className="text-[#FFB100]">Aman</span>
      </p>
    </div>
  );
}
