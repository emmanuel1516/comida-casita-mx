import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import categoryRoutes from "./routes/category.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

app.use("/api/categories", categoryRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});