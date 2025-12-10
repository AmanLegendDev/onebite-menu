import { connectDB } from "@/lib/db";
import MenuItem from "@/models/MenuItems";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";


export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const { stockChange } = body; // +5 or -5

    const item = await MenuItem.findById(id);
    if (!item) {
      return NextResponse.json({ success: false, message: "Item not found" });
    }

    // Update stock
    item.stock += Number(stockChange);

    // Prevent negative stock
    if (item.stock < 0) item.stock = 0;

    // Update out-of-stock
    item.outOfStock = item.stock <= 0;

    await item.save();

    return NextResponse.json({
      success: true,
      stock: item.stock,
      outOfStock: item.outOfStock,
    });
  } catch (err) {
    console.error("STOCK UPDATE ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
