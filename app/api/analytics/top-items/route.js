import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";

export async function GET() {
  await connectDB();

  const orders = await Order.find().lean();

  const itemMap = {};

  orders.forEach(order => {
    order.items.forEach(i => {
      if (!itemMap[i.name]) {
        itemMap[i.name] = { name: i.name, qty: 0, revenue: 0 };
      }
      itemMap[i.name].qty += i.qty;
      itemMap[i.name].revenue += i.qty * i.price;
    });
  });

  const sorted = Object.values(itemMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 10);

  return NextResponse.json({
    success: true,
    items: sorted
  });
}
