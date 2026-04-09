import { Router } from "express";
import {
    getTables,
    getTableById,
    createTable,
    updateTable,
    deleteTable
} from "../controllers/table.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";


const router = Router();

router.get("/", authMiddleware, getTables);
router.get("/:id", authMiddleware, getTableById);
router.post("/", authMiddleware, roleMiddleware("admin"), createTable);
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateTable);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteTable);

export default router;
