import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Rating from "@/models/Rating";

export async function GET() {
  await connectDB();

  const ratings = await Rating.find().lean();

  if (ratings.length === 0) {
    return NextResponse.json({
      average: 0,
      total: 0,
    });
  }

  const total = ratings.length;
  const avg =
    ratings.reduce((sum, r) => sum + r.stars, 0) / total;

  return NextResponse.json({
    average: avg,
    total,
  });
}
