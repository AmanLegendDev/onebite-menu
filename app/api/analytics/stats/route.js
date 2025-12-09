import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";
import CustomerUser from "@/models/CustomerUser";

export async function GET() {
  await connectDB();

  const totalCustomers = await CustomerUser.countDocuments();

  const orders = await Order.find().lean();

  const lifetimeRevenue = orders.reduce((t, o) => t + (o.finalPrice || 0), 0);

  // best customer by revenue
  const customerMap = {};

  orders.forEach(o => {
    if (!o.customerPhone) return;
    if (!customerMap[o.customerPhone]) {
      customerMap[o.customerPhone] = { phone: o.customerPhone, revenue: 0 };
    }
    customerMap[o.customerPhone].revenue += o.finalPrice || 0;
  });

  const bestCustomer = Object.values(customerMap).sort(
    (a, b) => b.revenue - a.revenue
  )[0] || null;

  return NextResponse.json({
    success: true,
    totalCustomers,
    lifetimeRevenue,
    bestCustomer,
  });
}
