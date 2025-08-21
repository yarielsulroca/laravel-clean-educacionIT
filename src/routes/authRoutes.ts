// src/routes/authRoutes.ts
import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { AuthController } from "../controllers/AuthController.ts";
import { authMiddleware } from "../middleware/auth.ts";

const router = new Router();

// Rutas públicas
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Rutas protegidas
router.get("/profile", authMiddleware, AuthController.getProfile);

export default router;
