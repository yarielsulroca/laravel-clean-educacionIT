// src/app.ts
import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { Database } from "./utils/database.ts";
import authRoutes from "./routes/authRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import productRoutes from "./routes/productRoutes.ts";

const app = new Application();
const router = new Router();

// Middleware global
app.use(async (ctx, next) => {
    // Logging
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.request.method} ${ctx.request.url.pathname} - ${ms}ms`);
});

// CORS
app.use(async (ctx, next) => {
    ctx.response.headers.set("Access-Control-Allow-Origin", "*");
    ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    if (ctx.request.method === "OPTIONS") {
        ctx.response.status = 200;
        return;
    }
    
    await next();
});

// Parse JSON
app.use(async (ctx, next) => {
    if (ctx.request.hasBody) {
        try {
            await ctx.request.body().value;
        } catch (error) {
            // Ignorar errores de parsing para rutas que no necesitan body
        }
    }
    await next();
});

// Rutas
router.get("/", (ctx) => {
    ctx.response.body = {
        message: "🚀 Panel Administrativo Deno API",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            users: "/api/users",
            products: "/api/products"
        },
        documentation: "Consulta la documentación para más detalles"
    };
});

// Health check
router.get("/health", (ctx) => {
    ctx.response.body = {
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: Date.now()
    };
});

// API routes
app.use(router.routes());
app.use(router.allowedMethods());

// Auth routes
app.use("/api/auth", authRoutes.routes());
app.use(authRoutes.allowedMethods());

// User routes
app.use("/api/users", userRoutes.routes());
app.use(userRoutes.allowedMethods());

// Product routes
app.use("/api/products", productRoutes.routes());
app.use(productRoutes.allowedMethods());

// Error handling
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.error("Error no manejado:", err);
        ctx.response.status = 500;
        ctx.response.body = {
            success: false,
            error: "Error interno del servidor"
        };
    }
});

// 404 handler
app.use((ctx) => {
    ctx.response.status = 404;
    ctx.response.body = {
        success: false,
        error: "Ruta no encontrada"
    };
});

// Inicializar aplicación
async function startApp() {
    try {
        // Inicializar base de datos
        await Database.initialize();
        
        const port = 8001; // Cambiado de 8000 a 8001
        console.log(`🚀 Servidor iniciado en http://localhost:${port}`);
        console.log("📊 Panel administrativo listo");
        console.log("🔐 Usa /api/auth/login para autenticarte");
        
        await app.listen({ port });
        
    } catch (error) {
        console.error("❌ Error iniciando la aplicación:", error);
        Deno.exit(1);
    }
}

// Manejar señales de terminación (compatible con Windows)
Deno.addSignalListener("SIGINT", async () => {
    console.log("\n🛑 Cerrando aplicación...");
    await Database.disconnect();
    Deno.exit(0);
});

// En Windows, usar SIGBREAK en lugar de SIGTERM
if (Deno.build.os === "windows") {
    Deno.addSignalListener("SIGBREAK", async () => {
        console.log("\n🛑 Cerrando aplicación...");
        await Database.disconnect();
        Deno.exit(0);
    });
} else {
    // En sistemas Unix/Linux/macOS
    Deno.addSignalListener("SIGTERM", async () => {
        console.log("\n🛑 Cerrando aplicación...");
        await Database.disconnect();
        Deno.exit(0);
    });
}

// Iniciar aplicación
startApp();
