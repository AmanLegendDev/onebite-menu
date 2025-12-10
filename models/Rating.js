import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    stars: { type: Number, required: true }, // 1–5
    orderId: { type: String, required: true },

    customerName: String,
    customerPhone: String,
  },
  { timestamps: true }
);

export default mongoose.models.Rating ||
  mongoose.model("Rating", RatingSchema);
