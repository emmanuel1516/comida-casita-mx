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

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS bloqueado para: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});