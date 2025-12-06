import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";  // ✔ correct

export async function PUT(req, { params }) {
  try {
    await connectDB();

    await Order.findByIdAndUpdate(params.id, {
      seenByAdmin: true,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

