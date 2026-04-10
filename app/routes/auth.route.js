import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

const router = Router();

router.post("/register", authMiddleware, roleMiddleware("admin"), registerUser);
router.post("/login", loginUser);

export default router;
