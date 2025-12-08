import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";
import CustomerSession from "@/models/CustomerSession";

export const dynamic = "force-dynamic";
export const revalidate = false;

// ===================== GET ORDERS =====================
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const latest = searchParams.get("latest");

    let orders = await Order.find().sort({ createdAt: -1 }).lean();

    if (latest === "true") {
      orders = orders.slice(0, 1);
    }

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.log("GET Orders Error:", err);
    return NextResponse.json({ success: false, orders: [] });
  }
}

// ===================== CREATE ORDER (POST) =====================
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    // 1️⃣ EXTRACT SESSION ID FROM FRONTEND
    const sessionId = body.customerSessionId;

    // 🔥 DEBUG LOG #1 — sessionId aa raha ya nahi
    console.log("📌 SESSION ID RECEIVED IN ORDER POST:", sessionId);

    // 2️⃣ FETCH CUSTOMER FROM SESSION COLLECTION
    let customer = null;

    if (sessionId) {
      customer = await CustomerSession.findOne({ sessionId }).lean();
    }

    // 🔥 DEBUG LOG #2 — DB me customer mila ya nahi
    console.log("📌 CUSTOMER FROM DB:", customer);

    // 3️⃣ CREATE ORDER WITH EMBEDDED CUSTOMER FIELDS
    const orderData = {
      ...body,
      customerName: customer?.name || "",
      customerPhone: customer?.phone || "",
      customerSessionId: sessionId || "",
    };

     if (orderData.discount == null) {
      orderData.discount = 0;
    }

    if (!orderData.finalPrice || orderData.finalPrice <= 0) {
      orderData.finalPrice = orderData.totalPrice;
    }

    // 🔥 DEBUG LOG #3 — Order save hone se pehle data kaisa hai?
    console.log("📌 FINAL ORDER DATA TO BE SAVED:", orderData);

    // 4️⃣ SAVE ORDER
    const newOrder = await Order.create(orderData);

    return NextResponse.json(
      { success: true, order: newOrder },
      { status: 201 }
    );

  } catch (err) {
    console.log("❌ Order POST Error:", err);
    return NextResponse.json(
      { success: false, message: "Order save failed", error: err.message },
      { status: 500 }
    );
  }
}
