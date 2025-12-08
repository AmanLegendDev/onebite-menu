import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import KOT from "@/models/KOT";
import CustomerUser from "@/models/CustomerUser";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { customerPhone } = body;

    // 1) Create new KOT entry
    const kotEntry = await KOT.create({
      table: body.table,
      tableId: body.tableId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      items: body.items,
      note: body.note || "",
      createdAt: new Date(),
    });

    // 2) Increment KOT count for this customer
    if (customerPhone) {
      let user = await CustomerUser.findOne({ phone: customerPhone });

      if (user) {
        user.totalKOT += 1;
        await user.save();
      }
    }

    return NextResponse.json({
      success: true,
      kot: kotEntry,
    });

  } catch (err) {
    console.error("KOT ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
