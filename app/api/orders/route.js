import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Orders from "@/models/Orders";

export async function GET() {
  try {
    await connectDB();
    const orders = await Orders.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.log("GET Orders Error:", err);
    return NextResponse.json({ success: false, orders: [] });
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const newOrder = await Orders.create(body);  // 👈 FIXED — correct model

    return NextResponse.json(
      { success: true, order: newOrder },
      { status: 201 }
    );
  } catch (err) {
    console.log("Order POST Error:", err);
    return NextResponse.json(
      { success: false, message: "Order save failed" },
      { status: 500 }
    );
  }
}
