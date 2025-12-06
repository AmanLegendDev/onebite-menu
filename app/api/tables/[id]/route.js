import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Table from "@/models/Table";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const table = await Table.findById(params.id).lean();

    if (!table) {
      return NextResponse.json({ success: false, message: "Table not found" });
    }

    return NextResponse.json({ success: true, table });
  } catch (err) {
    console.log("Table fetch error:", err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}
