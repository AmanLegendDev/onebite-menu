import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";

const MONGODB_URI = process.env.MONGODB_URI;

async function createAdmin() {
  if (!MONGODB_URI) {
    console.log("❌ MONGODB_URI NOT FOUND");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { dbName: "onebite-menu" });

  const password = await bcrypt.hash("admin123", 10);

  const admin = await User.create({
    name: "Super Admin",
    email: "admin@gmail.com",
    password: password,
    role: "admin",
  });

  console.log("✅ Admin Created:", admin);
  process.exit();
}

createAdmin();
