import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Allowed statuses
const ALLOWED = ["pending", "preparing", "ready", "served"];

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await req.json();
    const { status } = body || {};

    if (!ALLOWED.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const updateData = {
      status,
      seenByAdmin: true, // NEW badge hataane ke liye
    };

    // ✅ Agar order SERVED ho gaya => completedAt set karo
    if (status === "served") {
      updateData.completedAt = new Date();
    }

    const updated = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
    }).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Status update failed" },
      { status: 500 }
    );
  }
}
