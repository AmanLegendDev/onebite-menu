import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CustomerUser from "@/models/CustomerUser";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await CustomerUser.findOne({ phone });

    if (!user) {
      // Create new user
      user = await CustomerUser.create({
        name,
        phone,
        joinDate: new Date(),
        totalKOT: 1,
      });
    } else {
      // Update KOT count and name if changed
      user.totalKOT += 1;
      if (name && user.name !== name) {
        user.name = name;
      }
      await user.save();
    }

    return NextResponse.json({ success: true, user });

  } catch (err) {
    console.error("CREATE/UPDATE ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
