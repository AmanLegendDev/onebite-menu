import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MenuPage() {
  await connectDB();

  const categories = await Category.find().lean();

  if (!categories.length) {
    return <div className="p-6">No categories found.</div>;
  }

  const firstId = String(categories[0]._id);

  redirect(`/menu/${firstId}`);
}
