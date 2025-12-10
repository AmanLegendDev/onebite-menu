import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Rating from "@/models/Rating";

export async function GET() {
  await connectDB();

  const ratings = await Rating.find().sort({ createdAt: -1 }).lean();

  return NextResponse.json({ success: true, ratings });
}
