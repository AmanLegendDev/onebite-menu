import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";

export async function GET(req, { params }) {
  console.log("API PARAMS:", params);
  try {
    await connectDB();

    const order = await Order.findById(params.id).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found", order: null },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, order },
      { status: 200 }
    );
  } catch (err) {
    console.log("GET Order Error:", err);
    return NextResponse.json(
      { success: false, order: null },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();

    // ⭐ IMPORTANT FIX: Partial update allow karo
    const updated = await Order.findByIdAndUpdate(
      params.id,
      { $set: body },      // <-- Yaha magic hai
      { new: true }
    );

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    return NextResponse.json({ success: false });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    await Order.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: "Order deleted" },
      { status: 200 }
    );
  } catch (err) {
    console.log("DELETE Order Error:", err);
    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 }
    );
  }
}
