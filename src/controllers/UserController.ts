// src/controllers/UserController.ts
import { Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { Database } from "../utils/database.ts";
import { CreateUserDto, UpdateUserDto } from "../models/User.ts";

export class UserController {
    
    // Listar todos los usuarios
    static async getUsers(ctx: Context) {
        try {
            const users = await Database.getAllUsers();
            
            // Remover passwords de la respuesta
            const usersWithoutPasswords = users.map(({ password, ...user }) => user);
            
            ctx.response.body = {
                success: true,
                data: usersWithoutPasswords,
                total: usersWithoutPasswords.length
            };

        } catch (error) {
            console.error("Error obteniendo usuarios:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "Error al obtener usuarios"
            };
        }
    }

    // Obtener usuario por ID
    static async getUserById(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            
            if (isNaN(id)) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "ID inválido"
                };
                return;
            }

            const user = await Database.findUserById(id);
            if (!user) {
                ctx.response.status = 404;
                ctx.response.body = {
                    success: false,
                    error: "Usuario no encontrado"
                };
                return;
            }

            // Retornar sin password
            const { password, ...userWithoutPassword } = user;
            
            ctx.response.body = {
                success: true,
                data: userWithoutPassword
            };

        } catch (error) {
            console.error("Error obteniendo usuario:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "Error interno del servidor"
            };
        }
    }

    // Crear usuario (solo admin)
    static async createUser(ctx: Context) {
        try {
            // Verificar que sea admin
            if (ctx.state.user.role !== 'admin') {
                ctx.response.status = 403;
                ctx.response.body = {
                    success: false,
                    error: "Acceso denegado. Solo administradores pueden crear usuarios"
                };
                return;
            }

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

            // Hash del password
            const hashedPassword = await hash(body.password);

            // Crear usuario
            const user = await Database.createUser({
                ...body,
                password: hashedPassword,
                role: body.role || 'user'
            });

            // Retornar sin password
            const { password, ...userWithoutPassword } = user;
            
            ctx.response.status = 201;
            ctx.response.body = {
                success: true,
                message: "Usuario creado exitosamente",
                data: userWithoutPassword
            };

        } catch (error) {
            console.error("Error creando usuario:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "Error interno del servidor"
            };
        }
    }

    // Actualizar usuario
    static async updateUser(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            
            if (isNaN(id)) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "ID inválido"
                };
                return;
            }

            // Verificar permisos (solo puede actualizar su propio perfil o ser admin)
            if (ctx.state.user.userId !== id && ctx.state.user.role !== 'admin') {
                ctx.response.status = 403;
                ctx.response.body = {
                    success: false,
                    error: "No tienes permisos para actualizar este usuario"
                };
                return;
            }

            const body: UpdateUserDto = await ctx.request.body().value;
            
            // Si se está actualizando el password, hacer hash
            if (body.password) {
                body.password = await hash(body.password);
            }

            // Actualizar usuario
            const updatedUser = await Database.updateUser(id, body);
            if (!updatedUser) {
                ctx.response.status = 404;
                ctx.response.body = {
                    success: false,
                    error: "Usuario no encontrado"
                };
                return;
            }

            // Retornar sin password
            const { password, ...userWithoutPassword } = updatedUser;
            
            ctx.response.body = {
                success: true,
                message: "Usuario actualizado exitosamente",
                data: userWithoutPassword
            };

        } catch (error) {
            console.error("Error actualizando usuario:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "Error interno del servidor"
            };
        }
    }

    // Eliminar usuario (solo admin)
    static async deleteUser(ctx: Context) {
        try {
            // Verificar que sea admin
            if (ctx.state.user.role !== 'admin') {
                ctx.response.status = 403;
                ctx.response.body = {
                    success: false,
                    error: "Acceso denegado. Solo administradores pueden eliminar usuarios"
                };
                return;
            }

            const id = parseInt(ctx.params.id);
            
            if (isNaN(id)) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "ID inválido"
                };
                return;
            }

            // No permitir eliminar el propio usuario
            if (ctx.state.user.userId === id) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "No puedes eliminar tu propio usuario"
                };
                return;
            }

            const deleted = await Database.deleteUser(id);
            if (!deleted) {
                ctx.response.status = 404;
                ctx.response.body = {
                    success: false,
                    error: "Usuario no encontrado"
                };
                return;
            }

            ctx.response.body = {
                success: true,
                message: "Usuario eliminado exitosamente"
            };

        } catch (error) {
            console.error("Error eliminando usuario:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "Error interno del servidor"
            };
        }
    }
}
