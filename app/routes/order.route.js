import { Router } from "express";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", authMiddleware, getOrders);
router.get("/:id", authMiddleware, getOrderById);

router.post("/", authMiddleware, roleMiddleware("admin", "mesero"), createOrder);
router.put("/:id", authMiddleware, roleMiddleware("admin", "mesero"), updateOrder);
router.patch("/:id/status", authMiddleware, roleMiddleware("admin", "mesero"), updateOrderStatus);

router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteOrder);

export default router;