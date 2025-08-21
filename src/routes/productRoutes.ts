// src/routes/productRoutes.ts
import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { ProductController } from "../controllers/ProductController.ts";
import { authMiddleware } from "../middleware/auth.ts";

const router = new Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// CRUD de productos
router.get("/", ProductController.getProducts);
router.get("/dashboard", ProductController.getDashboard);
router.get("/search", ProductController.searchProducts);
router.get("/:id", ProductController.getProductById);
router.post("/", ProductController.createProduct);
router.put("/:id", ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);

export default router;
