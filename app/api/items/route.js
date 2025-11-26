import { connectDB } from "@/lib/db";
import MenuItems from "@/models/MenuItems";
import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import slugify from "slugify";

export async function POST(req) {
  try {
    await connectDB();
    
    const formData = await req.formData();

    const name = formData.get("name");
    const price = formData.get("price");
    const description = formData.get("description");
    const category = formData.get("category");
    const file = formData.get("image");

    let uploadedImageUrl = "";

    if (file && typeof file === "object") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadRes = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "menu-items" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });

      uploadedImageUrl = uploadRes.secure_url;
    }

    const slug = slugify(name, { lower: true });

    const item = await MenuItems.create({
      name,
      price,
      description,
      category,
      slug,
      image: uploadedImageUrl,
    });

    return NextResponse.json(item);
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const items = await MenuItems.find()
      .populate("category")
      .lean();

    // If no items or error → always return array
    if (!Array.isArray(items)) {
      return NextResponse.json([]);
    }

    return NextResponse.json(items);
  } catch (err) {
    console.error("ITEM GET ERROR:", err);
    return NextResponse.json([], { status: 200 });
  }
}

