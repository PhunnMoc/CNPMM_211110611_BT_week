import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { logout } from '../slices/authSlice'
import type { RootState } from '../index'
import type {
  Product,
  Category,
  User,
  Order,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  ProductsResponse,
  OrdersResponse,
} from '@/types'

// Create the API slice
const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState | undefined
    const token = state?.auth?.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

// Wrap baseQuery to handle 401 globally (auto-logout on invalid/expired token)
const baseQueryWithAuthHandling: typeof rawBaseQuery = async (args, api, extraOptions) => {
  const result: any = await rawBaseQuery(args, api, extraOptions)
  if (result?.error?.status === 401) {
    api.dispatch(logout())
  }
  return result
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuthHandling,
  tagTypes: ['Product', 'Category', 'User', 'Order', 'Review'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    // User endpoints
    getUserProfile: builder.query<User, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    
    updateUserProfile: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: '/users/profile',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    updateUserAvatar: builder.mutation<User, { avatarUrl: string }>({
      query: ({ avatarUrl }) => ({
        url: '/users/profile',
        method: 'PUT',
        body: { avatarUrl },
      }),
      invalidatesTags: ['User'],
    }),
    
    // Product endpoints
    getProducts: builder.query<ProductsResponse, { 
      page?: number; 
      limit?: number; 
      category?: string; 
      search?: string;
      sortBy?: string;
      sortOrder?: string;
      minPrice?: number;
      maxPrice?: number;
    }>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString())
          }
        })
        return `/products?${searchParams.toString()}`
      },
      providesTags: ['Product'],
    }),
    
    getProductById: builder.query<Product, number>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    
    getFeaturedProducts: builder.query<Product[], void>({
      query: () => '/products/featured',
      providesTags: ['Product'],
    }),
    
    // Category endpoints
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    
    // Order endpoints
    getOrders: builder.query<OrdersResponse, { page?: number; limit?: number }>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString())
          }
        })
        return `/orders?${searchParams.toString()}`
      },
      providesTags: ['Order'],
    }),
    
    getOrderById: builder.query<Order, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    
    createOrder: builder.mutation<Order, {
      items: Array<{ product_id: number; quantity: number }>;
      shipping_address: string;
      phone: string;
      notes?: string;
    }>({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
    }),
    
    updateOrderStatus: builder.mutation<Order, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Order'],
    }),
    
    cancelOrder: builder.mutation<Order, number>({
      query: (id) => ({
        url: `/orders/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Order'],
    }),

    // Reviews endpoints
    getReviews: builder.query<
      { reviews: any[]; pagination: { page: number; limit: number; total: number } },
      { productId: number; page?: number; limit?: number }
    >({
      query: ({ productId, page = 1, limit = 10 }) => {
        const sp = new URLSearchParams({ productId: String(productId), page: String(page), limit: String(limit) })
        return `/reviews?${sp.toString()}`
      },
      providesTags: (result, error, { productId }) => [{ type: 'Review', id: productId }],
    }),

    createReview: builder.mutation<
      { message: string; rewards?: { pointsAwarded: number } },
      { productId: number; rating: number; title?: string; comment?: string }
    >({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: (result, error, { productId }) => [{ type: 'Review', id: productId }, { type: 'Product', id: productId }],
    }),

    // Wishlist endpoints
    getWishlist: builder.query<any[], void>({
      query: () => '/users/wishlist',
      providesTags: ['User'],
    }),
    addToWishlist: builder.mutation<{ message: string }, { productId: number }>({
      query: ({ productId }) => ({ url: '/users/wishlist', method: 'POST', body: { productId } }),
      invalidatesTags: ['User'],
    }),
    removeFromWishlist: builder.mutation<{ message: string }, { productId: number }>({
      query: ({ productId }) => ({ url: `/users/wishlist/${productId}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),

    // Record product view
    recordProductView: builder.mutation<{ message: string }, number>({
      query: (id) => ({ url: `/products/${id}/view`, method: 'POST' }),
    }),

    // Recently viewed products
    getRecentProducts: builder.query<any[], void>({
      query: () => '/products/recent/list',
      providesTags: ['Product'],
    }),

    // User coupons
    getUserCoupons: builder.query<any[], { onlyAvailable?: boolean } | void>({
      query: (arg) => {
        const onlyAvailable = (arg as any)?.onlyAvailable ?? true
        const sp = new URLSearchParams({ onlyAvailable: onlyAvailable ? '1' : '0' })
        return `/users/coupons?${sp.toString()}`
      },
      providesTags: ['User'],
    }),
  }),
})

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateUserAvatarMutation,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetFeaturedProductsQuery,
  useGetCategoriesQuery,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useGetReviewsQuery,
  useCreateReviewMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useRecordProductViewMutation,
  useGetRecentProductsQuery,
  useGetUserCouponsQuery,
} = api
