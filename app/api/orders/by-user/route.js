import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({
        success: false,
        message: "Phone missing"
      });
    }

    // YAHI MAIN FILTER HAI 🔥
    const orders = await Order.find({ customerPhone: phone })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });

  } catch (err) {
    console.log("Order history error:", err);
    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}
