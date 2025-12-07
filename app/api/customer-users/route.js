import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CustomerUser from "@/models/CustomerUser";
import Order from "@/models/Orders";

export async function GET() {
  try {
    await connectDB();

    const users = await CustomerUser.find().sort({ joinDate: -1 });

    const enriched = await Promise.all(
      users.map(async (u) => {
        const lastOrder = await Order.findOne({ customerPhone: u.phone })
          .sort({ createdAt: -1 })
          .lean();

        return {
          _id: u._id.toString(),
          name: u.name,
          phone: u.phone,
          joinDate: u.joinDate || u.createdAt,
          totalKOT: u.totalKOT,
          coupon: u.coupon,
          lastOrderDate: lastOrder?.createdAt || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: enriched,
    });

  } catch (err) {
    console.error("CUSTOMER FETCH ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
