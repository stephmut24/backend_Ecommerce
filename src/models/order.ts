export interface Order {
  id: string;
  user_id: string;
  description?: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: Date;
}

export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface OrderResponse {
  id: string;
  user_id: string;
  description?: string;
  total_price: number;
  status: string;
  items: OrderItemResponse[];
  created_at: Date;
}

export interface OrderItemResponse {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}
