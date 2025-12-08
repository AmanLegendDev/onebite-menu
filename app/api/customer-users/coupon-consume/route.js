import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CustomerUser from "@/models/CustomerUser";

export async function POST(req) {
  try {
    await connectDB();
    const { phone, orderId } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone is required" },
        { status: 400 }
      );
    }

    const user = await CustomerUser.findOne({ phone });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      );
    }

    // Make sure history exists
    if (!Array.isArray(user.couponHistory)) {
      user.couponHistory = [];
    }

    // 👉 Push current active coupon into history
    if (user.coupon?.active) {
      user.couponHistory.push({
        amount: user.coupon.amount,
        type: user.coupon.type,
        maxDiscount: user.coupon.maxDiscount,
        code: user.coupon.code,
        appliedOn: new Date(),
        orderId: orderId || null,
      });
    }

    // ❌ Reset active coupon (one-time use)
    user.coupon = {
      active: false,
      type: "flat",
      amount: 0,
      maxDiscount: null,
      code: null,
      note: "",
    };

    await user.save();

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("COUPON CONSUME ERROR:", e);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}
