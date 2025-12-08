import mongoose from "mongoose";

const KOTSchema = new mongoose.Schema({
  table: String,
  tableId: String,
  customerName: String,
  customerPhone: String,

  items: [
    {
      name: String,
      qty: Number,
    },
  ],

  note: String,
  status: { type: String, default: "pending" }, 
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.KOT || mongoose.model("KOT", KOTSchema);
