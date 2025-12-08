import mongoose from "mongoose";

const CustomerUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    joinDate: {
      type: Date,
      default: Date.now,
    },

    totalKOT: {
      type: Number,
      default: 0,
    },

    // 🔥 ACTIVE ONE-TIME COUPON
    coupon: {
      active: { type: Boolean, default: false },
      type: { type: String, enum: ["flat", "percent"], default: "flat" },
      amount: { type: Number, default: 0 },         // flat = ₹, percent = %
      maxDiscount: { type: Number, default: null }, // only for percent
      code: { type: String, default: null },
      note: { type: String, default: "" },
      lastUsed: { type: Date, default: null }
    },

    // 🔥 USED COUPONS HISTORY
 couponHistory: [
  {
    amount: { type: Number, default: 0 },
    type: { type: String, default: "flat" },
    maxDiscount: { type: Number, default: null },
    code: { type: String, default: null },
    orderId: { type: String, default: null },
    appliedOn: { type: Date, default: Date.now },
  }
],

  },
  { timestamps: true }
);

export default mongoose.models.CustomerUser ||
  mongoose.model("CustomerUser", CustomerUserSchema);
