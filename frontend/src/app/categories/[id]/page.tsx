"use client"

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ProductCard } from '@/components/ProductCard'
import { Loader } from '@/components/Loader'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface ApiProduct {
   id: number
   name: string
   price: number | string
   discount_price?: number | string | null
   primary_image?: string | null
   description?: string
   category_name?: string
}

interface ProductsResponse {
   products: ApiProduct[]
   pagination: { page: number; limit: number; total: number; pages: number }
}

interface Category {
   id: number
   name: string
   description?: string
   image?: string
   product_count: number
}

export default function CategoryProductsPage() {
   const params = useParams()
   const router = useRouter()
   const categoryId = params.id as string
   const limit = 12

   const [category, setCategory] = useState<Category | null>(null)
   const [data, setData] = useState<ProductsResponse | null>(null)
   const [loading, setLoading] = useState(true)
   const [loadingMore, setLoadingMore] = useState(false)
   const [allProducts, setAllProducts] = useState<any[]>([])
   const [hasMore, setHasMore] = useState(true)
   const [currentPage, setCurrentPage] = useState(1)
   const observerRef = useRef<IntersectionObserver | null>(null)
   const loadMoreRef = useRef<HTMLDivElement | null>(null)

   // Load category info and initial products
   useEffect(() => {
      if (!categoryId) return

      const controller = new AbortController()
      async function loadCategoryAndProducts() {
         try {
            setLoading(true)

            // Load category info
            const categoryRes = await fetch(`/api/categories/${categoryId}`, { signal: controller.signal })
            if (!categoryRes.ok) throw new Error('Failed to load category')
            const categoryData = await categoryRes.json()
            setCategory(categoryData)

            // Load initial products
            const productsRes = await fetch(`/api/categories/${categoryId}/products?page=1&limit=${limit}`, { signal: controller.signal })
            if (!productsRes.ok) throw new Error('Failed to load products')
            const productsData = await productsRes.json()

            setData(productsData)
            setAllProducts(productsData.products)
            setCurrentPage(1)
            setHasMore(productsData.pagination.page < productsData.pagination.pages)
         } catch (e) {
            if (!(e instanceof DOMException)) console.error(e)
         } finally {
            setLoading(false)
         }
      }
      loadCategoryAndProducts()
      return () => controller.abort()
   }, [categoryId, limit])

   // Load more products function
   const loadMoreProducts = useCallback(async () => {
      if (loadingMore || !hasMore || !categoryId) return

      try {
         setLoadingMore(true)
         const nextPage = currentPage + 1
         const res = await fetch(`/api/categories/${categoryId}/products?page=${nextPage}&limit=${limit}`)
         if (!res.ok) throw new Error('Failed to load more products')
         const json = await res.json()

         setAllProducts(prev => [...prev, ...json.products])
         setCurrentPage(nextPage)
         setHasMore(nextPage < json.pagination.pages)
      } catch (e) {
         console.error('Error loading more products:', e)
      } finally {
         setLoadingMore(false)
      }
   }, [currentPage, hasMore, loadingMore, limit, categoryId])

   // Intersection Observer for infinite scroll
   useEffect(() => {
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver(
         (entries) => {
            if (entries[0].isIntersecting && hasMore && !loadingMore) {
               loadMoreProducts()
            }
         },
         { threshold: 0.1 }
      )

      if (loadMoreRef.current) {
         observerRef.current.observe(loadMoreRef.current)
      }

      return () => {
         if (observerRef.current) observerRef.current.disconnect()
      }
   }, [loadMoreProducts, hasMore, loadingMore])

   const products = useMemo(() => {
      return allProducts.map((p) => ({
         id: p.id,
         name: p.name,
         price: Number(p.price),
         discountPrice: p.discount_price != null ? Number(p.discount_price) : undefined,
         image: p.primary_image || null,
         rating: p.avg_rating || 0,
         reviewCount: p.review_count || 0,
      }))
   }, [allProducts])

   if (loading) {
      return (
         <div className="min-h-screen bg-cosmic">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
               <Loader />
            </div>
         </div>
      )
   }

   if (!category) {
      return (
         <div className="min-h-screen bg-cosmic">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
               <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
                  <Link href="/products" className="btn-primary rounded-full">Back to Products</Link>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="min-h-screen bg-cosmic">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Category Header */}
            <div className="mb-8 text-white">
               <div className="flex items-center justify-between mb-4">
                  <div>
                     <h1 className="text-2xl md:text-3xl font-bold">{category.name}</h1>
                     {category.description && (
                        <p className="text-white/70 mt-2">{category.description}</p>
                     )}
                     <p className="text-white/60 text-sm mt-1">
                        {category.product_count} products available
                     </p>
                  </div>
                  <Link href="/products" className="btn-primary rounded-full">All Products</Link>
               </div>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
               <div className="text-center text-white/60 py-12">
                  <p className="text-lg">No products found in this category</p>
                  <Link href="/products" className="btn-primary rounded-full mt-4">Browse All Products</Link>
               </div>
            ) : (
               <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                     {products.map((p) => (
                        <ProductCard key={p.id} product={p as any} />
                     ))}
                  </div>

                  {/* Lazy Loading Trigger */}
                  {hasMore && (
                     <div ref={loadMoreRef} className="flex justify-center mt-8">
                        {loadingMore ? (
                           <div className="flex items-center gap-2 text-white/80">
                              <LoadingSpinner />
                              <span>Loading more products...</span>
                           </div>
                        ) : (
                           <div className="text-white/60 text-sm">
                              Scroll down to load more products
                           </div>
                        )}
                     </div>
                  )}

                  {/* End of products message */}
                  {!hasMore && products.length > 0 && (
                     <div className="text-center mt-8 text-white/60">
                        <p>You've reached the end of the products in this category</p>
                        <p className="text-sm mt-2">Total products loaded: {products.length}</p>
                     </div>
                  )}
               </>
            )}
         </div>
      </div>
   )
}
