import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ success: false });

    order.paymentStatus = "paid";
    order.paidAt = new Date();

    await order.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.log("Mark paid error:", err);
    return NextResponse.json({ success: false });
  }
}
