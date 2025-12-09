import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Rating from "@/models/Rating";

export async function POST(req) {
  await connectDB();
  const body = await req.json();

  const rating = await Rating.create(body);

  return NextResponse.json({ success: true, rating });
}
