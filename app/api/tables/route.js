import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Table from "@/models/Table";

export const dynamic = "force-dynamic";
export const revalidate = false;

// GET: list all tables
export async function GET() {
  try {
    await connectDB();
    const tables = await Table.find().sort({ number: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, tables });
  } catch (err) {
    console.error("Tables GET Error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load tables" },
      { status: 500 }
    );
  }
}

// POST: create a new table
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    console.log("BODY FROM FRONTEND:", body);
console.log("ORDER WILL SAVE AS:", orderData);


    const { name, number } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    const table = await Table.create({
      name: name.trim(),
      number: number || undefined,
    });

    return NextResponse.json({ success: true, table }, { status: 201 });
  } catch (err) {
    console.error("Tables POST Error:", err);
    return NextResponse.json(
      { success: false, message: "Create table failed" },
      { status: 500 }
    );
  }
}
