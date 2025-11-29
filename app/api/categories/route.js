import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { NextResponse } from "next/server";
import slugify from "slugify";

export const dynamic = "force-dynamic";
export const revalidate = false;



export async function  POST(req){
    try{
        await connectDB()
        const {name} = await req.json()
        const slug = slugify(name,{lower: true})
        const categorie = await Category.create({name,slug})
        return NextResponse.json(categorie)
    }catch(err){
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function GET(){
    try{
        await connectDB()
        const catogry = await Category.find().sort({name: 1})
        return NextResponse.json(catogry)
    }catch(err){
        return NextResponse.json({error: err.message},{status: 500})
    }
}
export async function PUT(req){
    try{
        await connectDB()
        const {id,name} = await req.json()
        const slug = slugify(name,{lower: true})

        const updated = await Category.findByIdAndUpdate(id,{name, slug},{new:true})
        return NextResponse.json(updated)
    }catch(error){
        return NextResponse(
            {error: error.message},
            {status:500}
        )
    }
}

export async function DELETE(req){
    try{
        await connectDB()
        const {id} = await req.json()
        await Category.findByIdAndDelete(id)
        return NextResponse.json("deleted")
    }catch(err){
        return NextResponse.json(
            {error: err.message},
            {status:500}
        )
    }
}