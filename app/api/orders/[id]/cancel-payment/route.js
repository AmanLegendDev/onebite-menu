import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";

export async function POST(req, { params }) {
  try {
    await connectDB();

    const { id } = params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Cancel → reset everything
    order.paymentStatus = "cancelled";
    order.paymentMethod = null;

    await order.save();

    return NextResponse.json(
      { success: true, message: "Payment cancelled" },
      { status: 200 }
    );

  } catch (err) {
    console.log("Cancel payment error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
