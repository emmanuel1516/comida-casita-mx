import mongoose from "mongoose";

const tableSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },
    capacity: {
      type: Number,
      default: 4,
      min: 1,
    },
    assignedWaiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Waiter",
      default: null,
    },
    status: {
      type: String,
      enum: ["available", "occupied"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

export const Table = mongoose.model("Table", tableSchema);