// src/routes/userRoutes.ts
import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { UserController } from "../controllers/UserController.ts";
import { authMiddleware } from "../middleware/auth.ts";

const router = new Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// CRUD de usuarios
router.get("/", UserController.getUsers);
router.get("/:id", UserController.getUserById);
router.post("/", UserController.createUser);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

export default router;
