export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  product_price: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: number
  user_id: number
  total_amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled'
  shipping_address: string
  phone: string
  notes?: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export interface OrdersResponse {
  orders: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface OrderSummary {
  id: number
  order_number: string
  status: string
  total_amount: number
  payment_status: string
  created_at: string
  item_count: number
}


