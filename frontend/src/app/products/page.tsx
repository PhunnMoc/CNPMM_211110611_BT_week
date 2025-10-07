"use client"

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ProductCard } from '@/components/ProductCard'
import { Loader } from '@/components/Loader'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { showToast } from '@/utils/toast'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

interface ApiProduct {
   id: number
   name: string
   price: number | string
   discount_price?: number | string | null
   primary_image?: string | null
   description?: string
}

interface ProductsResponse {
   products: ApiProduct[]
   pagination: { page: number; limit: number; total: number; pages: number }
}

export default function ProductsPage() {
   const searchParams = useSearchParams()
   const router = useRouter()
   const page = parseInt(searchParams.get('page') || '1', 10)
   const q = (searchParams.get('q') || '').trim()
   const limit = 12
   const [data, setData] = useState<ProductsResponse | null>(null)
   const [loading, setLoading] = useState(true)
   const [loadingMore, setLoadingMore] = useState(false)
   const [allProducts, setAllProducts] = useState<any[]>([])
   const [hasMore, setHasMore] = useState(true)
   const [currentPage, setCurrentPage] = useState(1)
   const loadMoreRef = useRef<HTMLDivElement | null>(null)

   function dedupeById(items: any[]) {
      const map = new Map<number, any>()
      for (const item of items) {
         if (!map.has(item.id)) map.set(item.id, item)
      }
      return Array.from(map.values())
   }

   // Load initial products
   useEffect(() => {
      const controller = new AbortController()
      async function loadInitial() {
         try {
            setLoading(true)
            const url = q
               ? `/api/products/search?q=${encodeURIComponent(q)}&page=1&limit=${limit}`
               : `/api/products?page=1&limit=${limit}`
            const res = await fetch(url, { signal: controller.signal })
            if (!res.ok) throw new Error('Failed to load products')
            const json = await res.json()
            setData(json)
            setAllProducts(dedupeById(json.products))
            setCurrentPage(1)
            setHasMore(json.pagination.page < json.pagination.pages)
         } catch (e) {
            if (!(e instanceof DOMException)) console.error(e)
         } finally {
            setLoading(false)
         }
      }
      loadInitial()
      return () => controller.abort()
   }, [q])

   // Load more products function
   const loadMoreProducts = useCallback(async () => {
      if (loadingMore || !hasMore) return

      try {
         setLoadingMore(true)
         const nextPage = currentPage + 1
         const url = q
            ? `/api/products/search?q=${encodeURIComponent(q)}&page=${nextPage}&limit=${limit}`
            : `/api/products?page=${nextPage}&limit=${limit}`
         const res = await fetch(url)
         if (!res.ok) throw new Error('Failed to load more products')
         const json = await res.json()

         setAllProducts(prev => dedupeById([...prev, ...json.products]))
         setCurrentPage(nextPage)
         setHasMore(nextPage < json.pagination.pages)
      } catch (e) {
         console.error('Error loading more products:', e)
      } finally {
         setLoadingMore(false)
      }
   }, [currentPage, hasMore, loadingMore, limit, q])

   const { sentinelRef } = useInfiniteScroll({
      hasMore,
      isLoading: loadingMore,
      onLoadMore: loadMoreProducts,
      threshold: 0.01,
      rootMargin: '800px 0px 800px 0px',
   })

   // Scroll fallback: previously showed a debug toast; now removed per request
   useEffect(() => {
      function onScroll() { }
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
   }, [])

   const products = useMemo(() => {
      return allProducts.map((p) => ({
         id: p.id,
         name: p.name,
         price: Number(p.price),
         discountPrice: p.discount_price != null ? Number(p.discount_price) : undefined,
         image: p.primary_image || null,
         rating: 0,
         reviewCount: 0,
      }))
   }, [allProducts])

   return (
      <div className="min-h-screen bg-cosmic">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-6 text-white">
               <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
               <Link href="/" className="btn-primary rounded-full">Home</Link>
            </div>

            {loading ? (
               <Loader />
            ) : (
               <>
                  {products.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-20 text-white/70">
                        <p className="text-lg font-medium">No products found</p>
                        {q && (
                           <p className="text-sm mt-2">Try change the search query</p>
                        )}
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((p) => (
                           <ProductCard key={p.id} product={p as any} />
                        ))}
                     </div>
                  )}

                  {/* Lazy Loading Trigger */}
                  {hasMore && products.length > 0 && (
                     <div ref={(el) => { loadMoreRef.current = el; (sentinelRef as any).current = el }} className="flex justify-center mt-8 h-6">
                        {loadingMore && (
                           <div className="flex items-center gap-2 text-white/80">
                              <LoadingSpinner />
                              <span>Loading more products...</span>
                           </div>
                        )}
                     </div>
                  )}

                  {/* End of products message */}
                  {!hasMore && products.length > 0 && (
                     <div className="text-center mt-8 text-white/60">
                        <p>You've reached the end of the products list</p>
                        <p className="text-sm mt-2">Total products loaded: {products.length}</p>
                     </div>
                  )}

                  {/* Alternative pagination removed to keep lints clean. */}
               </>
            )}
         </div>
      </div>
   )
}


