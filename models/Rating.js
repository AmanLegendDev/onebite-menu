import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  stars: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Rating ||
  mongoose.model("Rating", RatingSchema);
