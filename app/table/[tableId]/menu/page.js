import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import MenuItems from "@/models/MenuItems";
import Table from "@/models/Table";
import { notFound } from "next/navigation";
import MenuClient from "@/app/menu/MenuClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TableMenuPage({ params }) {
  const { tableId } = params;

  await connectDB();

  const table = await Table.findById(tableId).lean();

  if (!table || table.isActive === false) {
    notFound();
  }

  const categories = await Category.find().lean();
  const items = await MenuItems.find().populate("category").lean();

  return (
    <MenuClient
      categories={JSON.parse(JSON.stringify(categories))}
      items={JSON.parse(JSON.stringify(items))}
      activeCategoryId={categories[0]?._id}
      tableInfo={{
        id: table._id.toString(),
        name: table.name,
        number: table.number,
      }}
    />
  );
}
