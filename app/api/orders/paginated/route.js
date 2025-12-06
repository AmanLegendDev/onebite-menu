import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const skip = (page - 1) * limit;

    // FIXED: Show ALL orders (pending + served) sorted latest → oldest
    const [orders, totalCount] = await Promise.all([
      Order.find({})
        .sort({ createdAt: -1 })   // IMPORTANT FIX
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments(),
    ]);

    const hasMore = skip + orders.length < totalCount;

    return NextResponse.json({
      success: true,
      orders,
      hasMore,
      page,
      limit,
    });
  } catch (err) {
    console.error("Paginated Orders Error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch paginated orders" },
      { status: 500 }
    );
  }
}
