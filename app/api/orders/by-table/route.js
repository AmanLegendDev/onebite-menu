import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();

    // ACTIVE = not completed/served
    const activeOrders = await Order.find({
      status: { $ne: "served" }
    })
      .sort({ createdAt: -1 })
      .lean();

    // Group by tableId OR old table string
    const grouped = {};

    for (const o of activeOrders) {
      const key = o.tableId ? o.tableId.toString() : o.table;
      if (!grouped[key]) {
        grouped[key] = {
          tableId: o.tableId || null,
          tableName: o.tableName || o.table || "Unknown",
          orders: []
        };
      }
      grouped[key].orders.push(o);
    }

    return NextResponse.json({
      success: true,
      groups: grouped
    });

  } catch (err) {
    console.error("BY-TABLE ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch" },
      { status: 500 }
    );
  }
}
