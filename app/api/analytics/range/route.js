import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";
export const dynamic = "force-dynamic";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") || 7);

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);

  const orders = await Order.find({
    createdAt: { $gte: start, $lte: end }
  }).lean();

  const dateMap = {};

  // Fill all days with 0
  for (let i = 0; i <= days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const key = d.toISOString().split("T")[0];

    dateMap[key] = { revenue: 0, count: 0 };
  }

  // Assign real values
  for (const o of orders) {
    const key = o.createdAt.toISOString().split("T")[0];
    if (dateMap[key]) {
      dateMap[key].revenue += o.finalPrice || 0;
      dateMap[key].count += 1;
    }
  }

  return NextResponse.json({
    success: true,
    labels: Object.keys(dateMap),
    revenue: Object.values(dateMap).map(v => v.revenue),
    orders: Object.values(dateMap).map(v => v.count),
    counts: Object.values(dateMap).map(v => v.count), // UI fallback support
  });
}
