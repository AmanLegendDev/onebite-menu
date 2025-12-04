import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Orders from "@/models/Orders";


export const dynamic = "force-dynamic";
export const revalidate = false;




export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const latest = searchParams.get("latest");

    let orders = await Orders.find().sort({ createdAt: -1 }).lean();

    if (latest === "true") {
      orders = orders.slice(0, 1);
    }

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
