import { Router } from "express";
import {
    getDishes,
    getDishById,
    createDish,
    updateDish,
    deleteDish
} from "../controllers/dish.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", authMiddleware, getDishes);
router.get("/:id", authMiddleware, getDishById);
router.post("/", authMiddleware, roleMiddleware("admin"), createDish);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateDish);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteDish);

export default router;
