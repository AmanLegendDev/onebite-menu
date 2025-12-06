import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    items: [
      {
        _id: String,
        name: String,
        price: Number,
        qty: Number,
        image: String,
      },
    ],

    totalQty: Number,
    totalPrice: Number,

    // OLD FIELD (keep for backward compatibility)
    table: {
      type: String,
      // required hata diya so old docs bhi safe
    },

    // NEW: proper relation with Table model
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
    },

    // NEW: store display name (e.g. "Table 1")
    tableName: {
      type: String,
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

    seenByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);
