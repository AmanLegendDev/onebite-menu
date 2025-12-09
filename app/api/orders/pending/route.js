import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find({
      paymentStatus: { $in: ["pending", "unpaid"] }
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.log("Pending payments error:", err);
    return NextResponse.json({ success: false, orders: [] });
  }
}
