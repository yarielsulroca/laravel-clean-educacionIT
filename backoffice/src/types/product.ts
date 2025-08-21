export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  user_id: number;
  image: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: number;
}