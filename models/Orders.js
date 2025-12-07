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

    // OLD FIELD (backward compatibility)
    table: {
      type: String,
    },

    // NEW: proper relation
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
    },

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

    // SESSION ID STORED
    customerSessionId: {
      type: String,
    },

    // ⭐ ADD THESE 2 FIELDS ⭐
    customerName: {
      type: String,
      default: "",
    },

    customerPhone: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order ||
  mongoose.model("Order", OrderSchema);
