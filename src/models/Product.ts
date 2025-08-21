// src/models/Product.ts
export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateProductDto {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
}

export interface UpdateProductDto {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    category?: string;
}

export interface ProductFilters {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
}
