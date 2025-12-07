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

    coupon: {
      code: { type: String, default: null },
      amount: { type: Number, default: 0 },
      active: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.models.CustomerUser ||
  mongoose.model("CustomerUser", CustomerUserSchema);
