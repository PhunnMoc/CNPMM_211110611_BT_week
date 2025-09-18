import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { 
  useGetProductsQuery, 
  useGetFeaturedProductsQuery,
  useGetProductByIdQuery 
} from '../store/api/api'

export const useProducts = (params: {
  page?: number
  limit?: number
  category?: string
  search?: string
  sortBy?: string
  sortOrder?: string
  minPrice?: number
  maxPrice?: number
} = {}) => {
  // Assert UI slice exists in store; provide safe fallback for searchQuery
  const ui = useSelector((state: RootState) => state.ui)!
  const filters = ui.filters
  const searchQuery = ui.searchQuery ?? ''
  
  const queryParams = useMemo(() => ({
    page: params.page || 1,
    limit: params.limit || 12,
    category: params.category || filters.category,
    search: params.search || searchQuery,
    sortBy: params.sortBy || filters.sortBy,
    sortOrder: params.sortOrder || filters.sortOrder,
    minPrice: params.minPrice || filters.minPrice,
    maxPrice: params.maxPrice || filters.maxPrice,
  }), [params, filters, searchQuery])

  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetProductsQuery(queryParams)

  return {
    products: data?.products || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 12,
    totalPages: data?.totalPages || 0,
    isLoading,
    isFetching,
    error,
    refetch,
    hasNextPage: (data?.page || 1) < (data?.totalPages || 0),
    hasPreviousPage: (data?.page || 1) > 1,
  }
}

export const useFeaturedProducts = () => {
  const {
    data: products = [],
    error,
    isLoading,
    refetch,
  } = useGetFeaturedProductsQuery()

  return {
    products,
    isLoading,
    error,
    refetch,
  }
}

export const useProduct = (id: number) => {
  const {
    data: product,
    error,
    isLoading,
    refetch,
  } = useGetProductByIdQuery(id, {
    skip: !id,
  })

  return {
    product,
    isLoading,
    error,
    refetch,
  }
}

export const useProductCategories = () => {
  const products = useProducts().products
  
  return useMemo(() => {
    const categories = new Map()
    products.forEach(product => {
      if (!categories.has(product.category_id)) {
        categories.set(product.category_id, {
          id: product.category_id,
          name: product.category_name,
          count: 0,
        })
      }
      categories.get(product.category_id).count++
    })
    return Array.from(categories.values())
  }, [products])
}

export const useProductStats = () => {
  const products = useProducts().products
  
  return useMemo(() => {
    const stats = {
      total: products.length,
      inStock: 0,
      outOfStock: 0,
      onSale: 0,
      averagePrice: 0,
      totalValue: 0,
    }
    
    if (products.length === 0) return stats
    
    products.forEach(product => {
      if (product.stock > 0) {
        stats.inStock++
      } else {
        stats.outOfStock++
      }
      
      if (product.discount_price && product.discount_price < product.price) {
        stats.onSale++
      }
      
      stats.totalValue += product.price * product.stock
    })
    
    stats.averagePrice = stats.totalValue / products.length
    
    return stats
  }, [products])
}
