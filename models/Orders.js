import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    items: [
      {
        _id: String,        // item ID
        name: String,
        price: Number,
        qty: Number,
        image: String,
      },
    ],

    totalQty: Number,
    totalPrice: Number,

    table: {
      type: String,
      required: true,
    },

    note: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "served"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
