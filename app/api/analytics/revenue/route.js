import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";
export const dynamic = "force-dynamic";


export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "7");

    const from = new Date();
    from.setDate(from.getDate() - days);

    const orders = await Order.find({
      createdAt: { $gte: from },
      paymentStatus: "paid"
    }).lean();

    // --- GROUP BY DATE ---
    const map = {};

    orders.forEach((o) => {
      const d = new Date(o.createdAt).toISOString().split("T")[0];

      if (!map[d]) map[d] = { revenue: 0, count: 0 };

      map[d].revenue += o.finalPrice || o.totalPrice || 0;
      map[d].count += 1;
    });

    const labels = Object.keys(map).sort();
    const revenue = labels.map((d) => map[d].revenue);
    const counts = labels.map((d) => map[d].count);

    // --- TOTALS ---
    const totalRevenue = revenue.reduce((a, b) => a + b, 0);
    const totalOrders = counts.reduce((a, b) => a + b, 0);
    const avgOrder = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

    // --- TODAY ---
    const todayKey = new Date().toISOString().split("T")[0];
    const todayRevenue = map[todayKey]?.revenue || 0;
    const todayOrders = map[todayKey]?.count || 0;

    // --- PEAK HOUR ---
    const hourMap = {};
    orders.forEach((o) => {
      const hr = new Date(o.createdAt).getHours();
      hourMap[hr] = (hourMap[hr] || 0) + 1;
    });

    const peakHour =
      Object.keys(hourMap).length === 0
        ? null
        : Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0][0] + ":00";

    return NextResponse.json({
      success: true,
      labels,
      revenue,
      counts,
      totalRevenue,
      totalOrders,
      avgOrder,
      peakHour,
      todayRevenue,
      todayOrders,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ success: false });
  }
}
