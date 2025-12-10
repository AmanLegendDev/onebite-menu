import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";
import CustomerUser from "@/models/CustomerUser";
export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();

  const start = new Date();
  start.setHours(0,0,0,0);

  const end = new Date();
  end.setHours(23,59,59,999);

  const orders = await Order.find({
    createdAt: { $gte: start, $lte: end }
  });

  const totalRevenue = orders.reduce((t, o) => t + (o.finalPrice || 0), 0);

  const totalOrders = orders.length;

  const avgOrderValue = totalOrders > 0 
    ? Math.round(totalRevenue / totalOrders) 
    : 0;

  const newCustomersToday = await CustomerUser.countDocuments({
    joinDate: { $gte: start, $lte: end }
  });

  const returningCustomers = orders.filter(o => o.customerPhone).length;

  return NextResponse.json({
    success: true,
    totalRevenue,
    totalOrders,
    avgOrderValue,
    newCustomersToday,
    returningCustomers,
  });
}
