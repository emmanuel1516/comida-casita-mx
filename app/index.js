import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import categoryRoutes from "./routes/category.route.js";
import authRoutes from "./routes/auth.route.js";
import dishRoutes from "./routes/dish.route.js";
import tableRoutes from "./routes/table.route.js";
import waiterRoutes from "./routes/waiter.route.js";
import orderRoutes from "./routes/order.route.js";

dotenv.config();

const app = express();
const normalizeOrigin = (value) => value?.replace(/\/+$/, "");

const localOriginPatterns = [
  /^https?:\/\/localhost:\d+$/,
  /^https?:\/\/127\.0\.0\.1:\d+$/,
  /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
  /^https?:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,
  /^https?:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/,
];

const allowedOrigins = new Set(
  [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.FRONTEND_URL,
  ]
    .map(normalizeOrigin)
    .filter(Boolean)
);

const corsOptions = {
  origin(origin, callback) {
    const normalizedOrigin = normalizeOrigin(origin);

    if (!normalizedOrigin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true);
    }

    const isLocalOrigin = localOriginPatterns.some((pattern) =>
      pattern.test(normalizedOrigin)
    );

    if (isLocalOrigin) {
      return callback(null, true);
    }

    return callback(new Error("Origen no permitido por CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch((error) => console.error("Error conectando a MongoDB:", error));

app.get("/", (req, res) => {
  res.send("API funcionando correctamente");
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dishes", dishRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/waiters", waiterRoutes);
app.use("/api/orders", orderRoutes);

app.use((error, req, res, next) => {
  if (error.message === "Origen no permitido por CORS") {
    return res.status(403).json({ message: error.message });
  }

  return next(error);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
