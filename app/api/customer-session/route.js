import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CustomerSession from "@/models/CustomerSession";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const sessionId = uuidv4();

    // Save in DB
    const session = await CustomerSession.create({
      name: body.name,
      phone: body.phone,
      tableId: body.tableId,
      sessionId,
    });

    return NextResponse.json({ success: true, sessionId });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
