import { connectDB } from "@/lib/db";
import MenuItem from "@/models/MenuItems";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const items = await MenuItem.find({
    stock: { $lte: 5 },
  }).lean();

  return NextResponse.json(items);
}
