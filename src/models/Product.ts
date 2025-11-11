export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  user_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  created_at: Date;
}