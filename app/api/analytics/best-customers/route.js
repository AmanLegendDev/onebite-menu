import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";
export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();

  const orders = await Order.find({
    paymentStatus: "paid",
    customerPhone: { $ne: "" }
  }).lean();

  const map = {};

  orders.forEach(o => {
    const phone = o.customerPhone;

    if (!map[phone]) {
      map[phone] = { phone, revenue: 0, orders: 0 };
    }

    map[phone].revenue += o.finalPrice || o.totalPrice || 0;
    map[phone].orders++;
  });

  const list = Object.values(map)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return NextResponse.json({
    success: true,
    customers: list
  });
}
