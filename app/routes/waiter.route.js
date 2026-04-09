import { Router } from "express";
import {
    getWaiters,
    getWaiterById,
    createWaiter,
    updateWaiter,
    deleteWaiter,
} from "../controllers/waiter.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", authMiddleware, getWaiters);
router.get("/:id", authMiddleware, getWaiterById);
router.post("/", authMiddleware, roleMiddleware("admin"), createWaiter);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateWaiter);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteWaiter);

export default router;