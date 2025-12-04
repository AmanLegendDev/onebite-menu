import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";     // ✅ SAME as your main route
import Orders from "@/models/Orders";     // ✅ SAME model

export const dynamic = "force-dynamic";
export const revalidate = false;

export async function GET(req) {
  try {
    await connectDB(); // ✅ correct function (NOT connectToDB)

    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const skip = (page - 1) * limit;

    // Fetch paginated + sorted latest first
    const [orders, totalCount] = await Promise.all([
      Orders.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Orders.countDocuments(),
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
