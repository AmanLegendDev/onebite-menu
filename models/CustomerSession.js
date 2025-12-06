import mongoose from "mongoose";

const CustomerSessionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    tableId: { type: String, required: true },

    sessionId: { type: String, required: true }, // UUID store karenge
    active: { type: Boolean, default: true },

    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.CustomerSession ||
  mongoose.model("CustomerSession", CustomerSessionSchema);
