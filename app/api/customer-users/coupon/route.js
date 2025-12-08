import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CustomerUser from "@/models/CustomerUser";

export const dynamic = "force-dynamic";

// 🟢 GET ACTIVE COUPON + HISTORY
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone is required" },
        { status: 400 }
      );
    }

    const user = await CustomerUser.findOne({ phone }).lean();

    if (!user) {
      return NextResponse.json({
        success: false,
        coupon: null,
      });
    }

    const c = user.coupon || {};

    return NextResponse.json({
      success: true,
      coupon: {
        active: !!c.active,
        type: c.type || "flat",
        amount: Number(c.amount) || 0,
        maxDiscount:
          c.maxDiscount === undefined || c.maxDiscount === null
            ? null
            : Number(c.maxDiscount),
        code: c.code || null,
        note: c.note || "",
        history: user.couponHistory || [],   // ⭐⭐ FIX — HISTORY COUPON KE ANDAR ⭐⭐
      },
    });

  } catch (err) {
    console.error("GET COUPON ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}


// 🟡 SAVE / UPDATE ACTIVE COUPON (NO HISTORY TOUCH)
export async function POST(req) {
  try {
    await connectDB();

    const { phone, amount, type, maxDiscount, code, note } = await req.json();

    if (!phone || !amount) {
      return NextResponse.json({ success: false, message: "Invalid data" });
    }

    const user = await CustomerUser.findOneAndUpdate(
      { phone },
      {
        $set: {
          "coupon.active": true,
          "coupon.amount": Number(amount),
          "coupon.type": type || "flat",
          "coupon.maxDiscount":
            type === "percent" ? Number(maxDiscount) || 0 : null,
          "coupon.code": code || null,
          "coupon.note": note || "",
        },
      },
      { new: true, upsert: true }
    ).lean();

    const c = user.coupon || {};
    console.log("USER FROM DB =", user);
console.log("USER.COUPON HISTORY =", user.couponHistory);
console.log("RETURNING HISTORY =", user.couponHistory || []);

    const coupon = {
      active: !!c.active,
      type: c.type || "flat",
      amount: Number(c.amount) || 0,
      maxDiscount:
        c.maxDiscount === undefined || c.maxDiscount === null
          ? null
          : Number(c.maxDiscount),
      code: c.code || null,
      note: c.note || "",
    };

    return NextResponse.json({
      success: true,
      coupon,
    });
  } catch (e) {
    console.log("COUPON SAVE ERROR:", e);
    return NextResponse.json({ success: false });
  }
}

