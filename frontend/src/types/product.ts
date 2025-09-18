export interface Product {
  id: number
  name: string
  description: string
  price: number
  discount_price?: number
  stock: number
  category_id: number
  category_name: string
  image?: string | null
  primary_image?: string | null
  rating?: number
  review_count?: number
  created_at: string
  updated_at: string
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ApiProduct {
   id: number
   name: string
   price: number | string
   discount_price?: number | string | null
   primary_image?: string | null
   description?: string
}

