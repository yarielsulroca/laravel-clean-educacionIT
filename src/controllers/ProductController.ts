// src/controllers/ProductController.ts
import { Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { Database } from "../utils/database.ts";
import { CreateProductDto, UpdateProductDto, ProductFilters } from "../models/Product.ts";

export class ProductController {
    
    // Listar productos con paginación y filtros
    static async getProducts(ctx: Context) {
        try {
            const url = new URL(ctx.request.url);
            const page = parseInt(url.searchParams.get('page') || '1');
            const limit = parseInt(url.searchParams.get('limit') || '10');
            const search = url.searchParams.get('search') || '';
            const category = url.searchParams.get('category') || '';
            const minPrice = url.searchParams.get('minPrice');
            const maxPrice = url.searchParams.get('maxPrice');

            let products = await Database.getAllProducts();

            // Aplicar filtros
            if (search) {
                products = await Database.searchProducts(search);
            }

            if (category) {
                products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
            }

            if (minPrice) {
                const min = parseFloat(minPrice);
                if (!isNaN(min)) {
                    products = products.filter(p => p.price >= min);
                }
            }

            if (maxPrice) {
                const max = parseFloat(maxPrice);
                if (!isNaN(max)) {
                    products = products.filter(p => p.price <= max);
                }
            }

            // Aplicar paginación
            const total = products.length;
            const totalPages = Math.ceil(total / limit);
            const start = (page - 1) * limit;
            const end = start + limit;
            const paginatedProducts = products.slice(start, end);

            ctx.response.body = {
                success: true,
                data: paginatedProducts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };

        } catch (error) {
            console.error("Error obteniendo productos:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "Error al obtener productos"
            };
        }
    }

    // Obtener producto por ID
    static async getProductById(ctx: Context) {
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

            const product = await Database.findProductById(id);
            if (!product) {
                ctx.response.status = 404;
                ctx.response.body = {
                    success: false,
                    error: "Producto no encontrado"
                };
                return;
            }

            ctx.response.body = {
                success: true,
                data: product
            };

        } catch (error) {
            console.error("Error obteniendo producto:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "Error interno del servidor"
            };
        }
    }

    // Crear producto
    static async createProduct(ctx: Context) {
        try {
            const body: CreateProductDto = await ctx.request.body().value;
            
            // Validaciones básicas
            if (body.price < 0) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "El precio no puede ser negativo"
                };
                return;
            }

            if (body.stock < 0) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "El stock no puede ser negativo"
                };
                return;
            }

            const product = await Database.createProduct(body);
            
            ctx.response.status = 201;
            ctx.response.body = {
                success: true,
                message: "Producto creado exitosamente",
                data: product
            };

        } catch (error) {
            console.error("Error creando producto:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "Error interno del servidor"
            };
        }
    }

    // Actualizar producto
    static async updateProduct(ctx: Context) {
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

            const body: UpdateProductDto = await ctx.request.body().value;
            
            // Validaciones
            if (body.price !== undefined && body.price < 0) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "El precio no puede ser negativo"
                };
                return;
            }

            if (body.stock !== undefined && body.stock < 0) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "El stock no puede ser negativo"
                };
                return;
            }

            const updatedProduct = await Database.updateProduct(id, body);
            if (!updatedProduct) {
                ctx.response.status = 404;
                ctx.response.body = {
                    success: false,
                    error: "Producto no encontrado"
                };
                return;
            }

            ctx.response.body = {
                success: true,
                message: "Producto actualizado exitosamente",
                data: updatedProduct
            };

        } catch (error) {
            console.error("Error actualizando producto:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "Error interno del servidor"
            };
        }
    }

    // Eliminar producto
    static async deleteProduct(ctx: Context) {
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

            const deleted = await Database.deleteProduct(id);
            if (!deleted) {
                ctx.response.status = 404;
                ctx.response.body = {
                    success: false,
                    error: "Producto no encontrado"
                };
                return;
            }

            ctx.response.body = {
                success: true,
                message: "Producto eliminado exitosamente"
            };

        } catch (error) {
            console.error("Error eliminando producto:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "Error interno del servidor"
            };
        }
    }

    // Dashboard de productos
    static async getDashboard(ctx: Context) {
        try {
            const stats = await Database.getDashboardStats();
            
            ctx.response.body = {
                success: true,
                data: stats
            };

        } catch (error) {
            console.error("Error obteniendo estadísticas:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "Error al obtener estadísticas"
            };
        }
    }

    // Búsqueda de productos
    static async searchProducts(ctx: Context) {
        try {
            const url = new URL(ctx.request.url);
            const query = url.searchParams.get('q') || '';
            
            if (!query.trim()) {
                ctx.response.status = 400;
                ctx.response.body = {
                    success: false,
                    error: "Término de búsqueda requerido"
                };
                return;
            }

            const products = await Database.searchProducts(query);
            
            ctx.response.body = {
                success: true,
                data: products,
                total: products.length,
                searchTerm: query
            };

        } catch (error) {
            console.error("Error en la búsqueda:", error);
            ctx.response.status = 500;
            ctx.response.body = {
                success: false,
                error: "Error en la búsqueda"
            };
        }
    }
}
