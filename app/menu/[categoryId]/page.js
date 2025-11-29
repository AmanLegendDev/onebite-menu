import MenuClient from "../MenuClient";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import MenuItems from "@/models/MenuItems";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoryMenuPage({ params }) {
  const { categoryId } = params;

  await connectDB();

  const categories = await Category.find().lean();
  const items = await MenuItems.find()
    .populate("category")
    .lean();

  const exists = categories.find((c) => String(c._id) === String(categoryId));
  if (!exists) {
    notFound();
  }

  return (
    <MenuClient
      categories={JSON.parse(JSON.stringify(categories))}
      items={JSON.parse(JSON.stringify(items))}
      activeCategoryId={categoryId}
    />
  );
}
