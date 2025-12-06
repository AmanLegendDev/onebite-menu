import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    await connectDB();

    const updated = await Order.findByIdAndUpdate(
      id,
      { status: "served" },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, order: updated },
      { status: 200 }
    );

  } catch (err) {
    console.log("Complete error:", err);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
