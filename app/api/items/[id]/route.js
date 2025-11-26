import { connectDB } from "@/lib/db";
import MenuItems from "@/models/MenuItems";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB();
  const item = await MenuItems.findById(params.id).populate("category");
  return NextResponse.json(item);
}

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const form = await req.formData();

    const name = form.get("name");
    const price = form.get("price");
    const description = form.get("description");
    const category = form.get("category");
    const image = form.get("image");

    let uploaded = null;

    if (image && typeof image === "object") {
      const buffer = Buffer.from(await image.arrayBuffer());

      uploaded = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "menu-items" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });
    }

    const updated = {
      name,
      price,
      description,
      category,
    };

    if (uploaded) updated.image = uploaded.secure_url;

    await MenuItems.findByIdAndUpdate(params.id, updated);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req,{params}) {
    try{
        await connectDB()
        await MenuItems.findByIdAndDelete(params.id)
        return NextResponse.json({success: true})
    }catch(err){
        return NextResponse.json({error: err.message},{status:500})
    }
    
}