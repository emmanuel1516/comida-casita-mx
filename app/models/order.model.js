import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["mesa", "delivery"],
      required: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      default: null,
    },
    customerName: {
      type: String,
      trim: true,
      default: "",
    },
    customerPhone: {
      type: String,
      trim: true,
      default: "",
    },
    deliveryAddress: {
      type: String,
      trim: true,
      default: "",
    },
    specialNotes: {
      type: String,
      trim: true,
      default: "",
    },
    waiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Waiter",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (value) => value.length > 0,
        "El pedido debe tener al menos un ítem",
      ],
    },
    status: {
      type: String,
      enum: ["pendiente", "preparando", "listo", "entregado"],
      default: "pendiente",
    },
    shift: {
      type: String,
      enum: ["mañana", "tarde"],
      required: true,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    tip: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderSchema);