import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";
import CustomerSession from "@/models/CustomerSession";
import KOT from "@/models/KOT";
import Counter from "@/models/Counter";
import MenuItem from "@/models/MenuItems";

export const dynamic = "force-dynamic";
export const revalidate = false;

// ===================== GET ORDERS =====================
// ===================== GET ORDERS =====================
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const latest = searchParams.get("latest");
    const status = searchParams.get("status");
    const payment = searchParams.get("payment");

    let filter = {};

    // STATUS FILTER (order flow)
    if (status) filter.status = status;

    // PAYMENT FILTER (your bug fix)
    if (payment === "pending") filter.paymentStatus = "pending";
    if (payment === "paid") filter.paymentStatus = "paid";
    if (payment === "cancelled") filter.paymentStatus = "cancelled";

    // latest order fetch
    if (latest === "true") {
      const latestOrder = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(1)
        .lean();
      return NextResponse.json({ success: true, orders: latestOrder });
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.log("GET Orders Error:", err);
    return NextResponse.json({ success: false, orders: [] });
  }
}




// ===================== CREATE ORDER (POST) =====================
export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const sessionId = body.customerSessionId;

    // 1️⃣ Load customer
    const customer = sessionId
      ? await CustomerSession.findOne({ sessionId }).lean()
      : null;

    // 2️⃣ Prepare order base data
    const orderData = {
      ...body,
      customerName: customer?.name || "",
      customerPhone: customer?.phone || "",
      customerSessionId: sessionId || "",
      discount: body.discount || 0,
      finalPrice: body.finalPrice || body.totalPrice
    };

    // 3️⃣ Generate New KOT Number
    const kotCounter = await Counter.findOneAndUpdate(
      { key: "kot" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const kotId = `KOT${String(kotCounter.seq).padStart(4, "0")}`;

    // 4️⃣ Create KOT Entry
    const kotEntry = await KOT.create({
      kotId,
      table: body.table,
      tableId: body.tableId,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      items: body.items.map(i => ({ name: i.name, qty: i.qty })),
      note: body.note || "",
      createdAt: new Date()
    });

    // 5️⃣ Save order with kotId
    orderData.kotId = kotId;

orderData.createdAt = new Date(); // FORCE UNIQUE TIMESTAMP
orderData.updatedAt = new Date();

const newOrder = await Order.create(orderData);

    // 6️⃣ Decrease Stock
    try {
      const itemsToDecrease = (body.items || []).map(i => ({
        id: i._id,
        qty: i.qty
      }));

      const bulkOps = itemsToDecrease.map(it => ({
        updateOne: {
          filter: { _id: it.id },
          update: { $inc: { stock: -(it.qty || 0) } }
        }
      }));

      if (bulkOps.length > 0) {
        await MenuItem.bulkWrite(bulkOps);
        await MenuItem.updateMany(
          { stock: { $lte: 0 } },
          { $set: { stock: 0, outOfStock: true } }
        );
        await MenuItem.updateMany(
          { stock: { $gt: 0 } },
          { $set: { outOfStock: false } }
        );
      }
    } catch (e) {
      console.error("Stock decrease error:", e);
    }

    // 7️⃣ Return response
    return NextResponse.json(
      { success: true, order: newOrder },
      { status: 201 }
    );

  } catch (err) {
    console.log("❌ Order POST Error:", err);
    return NextResponse.json(
      { success: false, message: "Order save failed", error: err.message },
      { status: 500 }
    );
  }
}
