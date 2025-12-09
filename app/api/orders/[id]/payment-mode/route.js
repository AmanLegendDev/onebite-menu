import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { mode } = await req.json();

    if (!mode) {
      return NextResponse.json({ success: false, message: "Mode required" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" });
    }

    order.paymentMethod = mode; // "upi" | "cash"
    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.log("Payment mode API error:", err);
    return NextResponse.json({ success: false });
  }
}
