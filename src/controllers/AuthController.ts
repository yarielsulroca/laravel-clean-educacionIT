// src/controllers/AuthController.ts
import { Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { create } from "https://deno.land/x/djwt@v2.9.1/mod.ts";
import { compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { Database } from "../utils/database.ts";
import { LoginDto, CreateUserDto, AuthResponse } from "../models/User.ts";

export class AuthController {
    
    // Registro de usuarios
    static async register(ctx: Context) {
        try {
            const body: CreateUserDto = await ctx.request.body().value;
            
            // Validar que el email no exista
            const existingUser = await Database.findUserByEmail(body.email);
            if (existingUser) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "El email ya está registrado"
                };
                return;
            }

            // Crear usuario
            const user = await Database.createUser({
                ...body,
                role: body.role || 'user'
            });

            // Generar token
            const token = await create(
                { alg: "HS256", typ: "JWT" },
                { 
                    userId: user.id, 
                    email: user.email, 
                    role: user.role,
                    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
                },
                "tu_secret_key_super_segura"
            );

            // Retornar respuesta sin password
            const { password, ...userWithoutPassword } = user;
            
            ctx.response.status = 201;
            ctx.response.body = {
                success: true,
                message: "Usuario registrado exitosamente",
                data: {
                    user: userWithoutPassword,
                    token
                }
            };

        } catch (error) {
            console.error("Error en registro:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "Error interno del servidor"
            };
        }
    }

    // Login de usuarios
    static async login(ctx: Context) {
        try {
            const body: LoginDto = await ctx.request.body().value;
            
            // Buscar usuario por email
            const user = await Database.findUserByEmail(body.email);
            if (!user) {
                ctx.response.status = 401;
                ctx.response.body = {
                    success: false,
                    error: "Credenciales inválidas"
                };
                return;
            }

            // Verificar password
            const isValidPassword = await compare(body.password, user.password);
            if (!isValidPassword) {
                ctx.response.status = 401;
                ctx.response.body = {
                    success: false,
                    error: "Credenciales inválidas"
                };
                return;
            }

            // Generar token
            const token = await create(
                { alg: "HS256", typ: "JWT" },
                { 
                    userId: user.id, 
                    email: user.email, 
                    role: user.role,
                    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
                },
                "tu_secret_key_super_segura"
            );

            // Retornar respuesta sin password
            const { password, ...userWithoutPassword } = user;
            
            ctx.response.body = {
                success: true,
                message: "Login exitoso",
                data: {
                    user: userWithoutPassword,
                    token
                }
            };

        } catch (error) {
            console.error("Error en login:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "Error interno del servidor"
            };
        }
    }

    // Obtener perfil del usuario autenticado
    static async getProfile(ctx: Context) {
        try {
            const user = ctx.state.user;
            
            if (!user) {
                ctx.response.status = 401;
                ctx.response.body = {
                    success: false,
                    error: "Usuario no autenticado"
                };
                return;
            }

            const userData = await Database.findUserById(user.userId);
            if (!userData) {
                ctx.response.status = 404;
                ctx.response.body = {
                    success: false,
                    error: "Usuario no encontrado"
                };
                return;
            }

            // Retornar sin password
            const { password, ...userWithoutPassword } = userData;
            
            ctx.response.body = {
                success: true,
                data: userWithoutPassword
            };

        } catch (error) {
            console.error("Error obteniendo perfil:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "Error interno del servidor"
            };
        }
    }
}
