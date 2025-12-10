import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MenuItem from "@/models/MenuItems";
export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await req.json();
    const { qty } = body; // qty = customer bought quantity

    if (!qty || qty <= 0) {
      return NextResponse.json({ success: false, message: "Invalid qty" });
    }

    const item = await MenuItem.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, message: "Item not found" });
    }

    // Reduce stock
    item.stock = Math.max(0, item.stock - qty);

    // If item is now 0 → mark out of stock
    item.outOfStock = item.stock <= 0;

    await item.save();

    return NextResponse.json({
      success: true,
      stock: item.stock,
      outOfStock: item.outOfStock,
    });
  } catch (err) {
    console.log("REDUCE STOCK ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}