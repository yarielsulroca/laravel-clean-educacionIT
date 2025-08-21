// src/middleware/auth.ts
import { Context, Next } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { verify } from "https://deno.land/x/djwt@v2.9.1/mod.ts";

export async function authMiddleware(ctx: Context, next: Next) {
    try {
        const authHeader = ctx.request.headers.get("Authorization");
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            ctx.response.status = 401;
            ctx.response.body = {
                success: false,
                error: "Token de autenticación requerido"
            };
            return;
        }
        
        const token = authHeader.substring(7);
        
        try {
            // Verificar JWT
            const payload = await verify(token, "tu_secret_key_super_segura");
            
            // Añadir usuario al contexto
            ctx.state.user = payload;
            
            await next();
        } catch (jwtError) {
            ctx.response.status = 401;
            ctx.response.body = {
                success: false,
                error: "Token inválido o expirado"
            };
        }
        
    } catch (error) {
        ctx.response.status = 500;
        ctx.response.body = {
            success: false,
            error: "Error de autenticación"
        };
    }
}

// Middleware opcional para rutas que pueden ser públicas o privadas
export async function optionalAuthMiddleware(ctx: Context, next: Next) {
    try {
        const authHeader = ctx.request.headers.get("Authorization");
        
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.substring(7);
            
            try {
                const payload = await verify(token, "tu_secret_key_super_segura");
                ctx.state.user = payload;
            } catch (jwtError) {
                // Token inválido, pero continuar sin usuario
                ctx.state.user = null;
            }
        } else {
            ctx.state.user = null;
        }
        
        await next();
        
    } catch (error) {
        ctx.state.user = null;
        await next();
    }
}
