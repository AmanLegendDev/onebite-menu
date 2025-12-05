import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "./models/User.js";

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdmin() {
  try {
    if (!MONGODB_URI) {
      console.log("❌ MONGODB_URI NOT FOUND");
      process.exit(1);
    }

    console.log("⏳ Connecting...");
    await mongoose.connect(MONGODB_URI, { dbName: "onebite-menu" });

    // DEFAULT admin
    const password = await bcrypt.hash("onebiteadmin123", 10);

    const admin = await User.create({
      name: "Super Admin",
      email: "onebite@admin.com",
      password,
      role: "admin",
    });

    console.log("✅ ADMIN CREATED SUCCESSFULLY:", admin);
    process.exit(0);
  } catch (err) {
    console.log("❌ ERROR:", err);
    process.exit(1);
  }
}

createAdmin();
