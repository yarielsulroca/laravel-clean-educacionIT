// src/utils/database.ts
import { User } from "../models/User.ts";
import { Product } from "../models/Product.ts";
import { hash, compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

// Configuración de la base de datos MySQL de Laravel
const DB_CONFIG = {
    hostname: "localhost",
    username: "root",
    password: "",
    database: "educacionit",
    port: 3306
};

// Clase para manejar la conexión a MySQL
export class Database {
    private static connection: any = null;

    // Conectar a MySQL
    static async connect() {
        try {
            // Usar el driver MySQL de Deno
            const { Client } = await import("https://deno.land/x/mysql@v2.11.0/mod.ts");
            
            this.connection = new Client();
            await this.connection.connect(DB_CONFIG);
            
            console.log("✅ Conectado a MySQL de Laravel");
        } catch (error) {
            console.error("❌ Error conectando a MySQL:", error);
            throw error;
        }
    }

    // Desconectar de MySQL
    static async disconnect() {
        if (this.connection) {
            await this.connection.close();
            console.log("🔌 Desconectado de MySQL");
        }
    }

    // Métodos para usuarios
    static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        try {
            const hashedPassword = await hash(userData.password);
            
            const result = await this.connection.execute(
                "INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
                [userData.name, userData.email, hashedPassword, userData.role || 'user']
            );

            const userId = result.lastInsertId;
            return await this.findUserById(userId);
        } catch (error) {
            console.error("Error creando usuario:", error);
            throw error;
        }
    }

    static async findUserById(id: number): Promise<User | null> {
        try {
            const users = await this.connection.query(
                "SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE id = ?",
                [id]
            );
            
            if (users.length === 0) return null;
            
            const user = users[0];
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
                role: user.role,
                createdAt: new Date(user.created_at),
                updatedAt: new Date(user.updated_at)
            };
        } catch (error) {
            console.error("Error buscando usuario por ID:", error);
            return null;
        }
    }

    static async findUserByEmail(email: string): Promise<User | null> {
        try {
            const users = await this.connection.query(
                "SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = ?",
                [email]
            );
            
            if (users.length === 0) return null;
            
            const user = users[0];
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
                role: user.role,
                createdAt: new Date(user.created_at),
                updatedAt: new Date(user.updated_at)
            };
        } catch (error) {
            console.error("Error buscando usuario por email:", error);
            return null;
        }
    }

    static async getAllUsers(): Promise<User[]> {
        try {
            const users = await this.connection.query(
                "SELECT id, name, email, password, role, created_at, updated_at FROM users ORDER BY id DESC"
            );
            
            return users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.password,
                role: user.role,
                createdAt: new Date(user.created_at),
                updatedAt: new Date(user.updated_at)
            }));
        } catch (error) {
            console.error("Error obteniendo usuarios:", error);
            return [];
        }
    }

    static async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
        try {
            const updates: string[] = [];
            const values: any[] = [];
            
            if (userData.name) {
                updates.push("name = ?");
                values.push(userData.name);
            }
            if (userData.email) {
                updates.push("email = ?");
                values.push(userData.email);
            }
            if (userData.password) {
                updates.push("password = ?");
                values.push(await hash(userData.password));
            }
            if (userData.role) {
                updates.push("role = ?");
                values.push(userData.role);
            }
            
            updates.push("updated_at = NOW()");
            values.push(id);
            
            await this.connection.execute(
                `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
                values
            );
            
            return await this.findUserById(id);
        } catch (error) {
            console.error("Error actualizando usuario:", error);
            return null;
        }
    }

    static async deleteUser(id: number): Promise<boolean> {
        try {
            const result = await this.connection.execute(
                "DELETE FROM users WHERE id = ?",
                [id]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error eliminando usuario:", error);
            return false;
        }
    }

    // Métodos para productos
    static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
        try {
            const result = await this.connection.execute(
                "INSERT INTO products (name, description, price, stock, category, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
                [productData.name, productData.description, productData.price, productData.stock, productData.category, 1] // user_id = 1 por defecto
            );

            const productId = result.lastInsertId;
            return await this.findProductById(productId);
        } catch (error) {
            console.error("Error creando producto:", error);
            throw error;
        }
    }

    static async findProductById(id: number): Promise<Product | null> {
        try {
            const products = await this.connection.query(
                "SELECT id, name, description, price, stock, category, created_at, updated_at FROM products WHERE id = ?",
                [id]
            );
            
            if (products.length === 0) return null;
            
            const product = products[0];
            return {
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category,
                createdAt: new Date(product.created_at),
                updatedAt: new Date(product.updated_at)
            };
        } catch (error) {
            console.error("Error buscando producto por ID:", error);
            return null;
        }
    }

    static async getAllProducts(): Promise<Product[]> {
        try {
            const products = await this.connection.query(
                "SELECT id, name, description, price, stock, category, created_at, updated_at FROM products ORDER BY id DESC"
            );
            
            return products.map(product => ({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category,
                createdAt: new Date(product.created_at),
                updatedAt: new Date(product.updated_at)
            }));
        } catch (error) {
            console.error("Error obteniendo productos:", error);
            return [];
        }
    }

    static async updateProduct(id: number, productData: Partial<Product>): Promise<Product | null> {
        try {
            const updates: string[] = [];
            const values: any[] = [];
            
            if (productData.name) {
                updates.push("name = ?");
                values.push(productData.name);
            }
            if (productData.description) {
                updates.push("description = ?");
                values.push(productData.description);
            }
            if (productData.price !== undefined) {
                updates.push("price = ?");
                values.push(productData.price);
            }
            if (productData.stock !== undefined) {
                updates.push("stock = ?");
                values.push(productData.stock);
            }
            if (productData.category) {
                updates.push("category = ?");
                values.push(productData.category);
            }
            
            updates.push("updated_at = NOW()");
            values.push(id);
            
            await this.connection.execute(
                `UPDATE products SET ${updates.join(", ")} WHERE id = ?`,
                values
            );
            
            return await this.findProductById(id);
        } catch (error) {
            console.error("Error actualizando producto:", error);
            return null;
        }
    }

    static async deleteProduct(id: number): Promise<boolean> {
        try {
            const result = await this.connection.execute(
                "DELETE FROM products WHERE id = ?",
                [id]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error eliminando producto:", error);
            return false;
        }
    }

    // Métodos de búsqueda y filtrado
    static async searchProducts(query: string): Promise<Product[]> {
        try {
            const products = await this.connection.query(
                "SELECT id, name, description, price, stock, category, created_at, updated_at FROM products WHERE name LIKE ? OR description LIKE ? ORDER BY id DESC",
                [`%${query}%`, `%${query}%`]
            );
            
            return products.map(product => ({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category,
                createdAt: new Date(product.created_at),
                updatedAt: new Date(product.updated_at)
            }));
        } catch (error) {
            console.error("Error buscando productos:", error);
            return [];
        }
    }

    static async getProductsWithPagination(page: number, limit: number): Promise<{
        products: Product[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        try {
            // Obtener total de productos
            const totalResult = await this.connection.query("SELECT COUNT(*) as total FROM products");
            const total = totalResult[0].total;
            
            // Obtener productos paginados
            const offset = (page - 1) * limit;
            const products = await this.connection.query(
                "SELECT id, name, description, price, stock, category, created_at, updated_at FROM products ORDER BY id DESC LIMIT ? OFFSET ?",
                [limit, offset]
            );
            
            const mappedProducts = products.map(product => ({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category,
                createdAt: new Date(product.created_at),
                updatedAt: new Date(product.updated_at)
            }));
            
            const totalPages = Math.ceil(total / limit);

            return {
                products: mappedProducts,
                total,
                page,
                totalPages
            };
        } catch (error) {
            console.error("Error obteniendo productos paginados:", error);
            return {
                products: [],
                total: 0,
                page,
                totalPages: 0
            };
        }
    }

    // Métodos de estadísticas
    static async getDashboardStats(): Promise<{
        totalUsers: number;
        totalProducts: number;
        lowStockProducts: number;
        expensiveProducts: number;
    }> {
        try {
            const [usersResult, productsResult, lowStockResult, expensiveResult] = await Promise.all([
                this.connection.query("SELECT COUNT(*) as total FROM users"),
                this.connection.query("SELECT COUNT(*) as total FROM products"),
                this.connection.query("SELECT COUNT(*) as total FROM products WHERE stock < 10"),
                this.connection.query("SELECT COUNT(*) as total FROM products WHERE price > 1000")
            ]);

            return {
                totalUsers: usersResult[0].total,
                totalProducts: productsResult[0].total,
                lowStockProducts: lowStockResult[0].total,
                expensiveProducts: expensiveResult[0].total
            };
        } catch (error) {
            console.error("Error obteniendo estadísticas:", error);
            return {
                totalUsers: 0,
                totalProducts: 0,
                lowStockProducts: 0,
                expensiveProducts: 0
            };
        }
    }

    // Inicializar conexión a la base de datos
    static async initialize() {
        try {
            await this.connect();
            console.log("✅ Base de datos MySQL inicializada");
            console.log("📊 Conectado a la base de datos de Laravel");
        } catch (error) {
            console.error("❌ Error inicializando base de datos:", error);
            throw error;
        }
    }
}
