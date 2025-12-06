import mongoose from "mongoose";

const TableSchema = new mongoose.Schema(
  {
    // Visible name/label (for admin + bill)
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional: numeric table number (1,2,3...)
    number: {
      type: Number,
    },

    // Active / inactive (for future)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Table || mongoose.model("Table", TableSchema);
