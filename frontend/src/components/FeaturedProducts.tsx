'use client'

import { useQuery } from '@tanstack/react-query'
import { ProductCard } from './ProductCard'
import { AlertTriangle } from 'lucide-react'
import { Loader } from './Loader'

interface Product {
   id: number
   name: string
   price: number
   discountPrice?: number
   image: string
   rating: number
   reviewCount: number
}

async function fetchFeaturedProducts(): Promise<Product[]> {
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/featured`)
   if (!response.ok) {
      throw new Error('Failed to fetch featured products')
   }
   return response.json()
}

export function FeaturedProducts() {
   const { data: products, isLoading, error } = useQuery({
      queryKey: ['featured-products'],
      queryFn: fetchFeaturedProducts,
   })

   if (isLoading) return <Loader />
   if (error) return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div className="glass-card p-4 text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Failed to load featured products.</span>
         </div>
      </div>
   )

   return (
      <section className="py-16 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Featured Products
               </h2>
               <p className="text-lg text-gray-600">
                  Discover our most popular and highly-rated products
               </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {products?.map((product) => (
                  <ProductCard key={product.id} product={product} />
               ))}
            </div>

            <div className="text-center mt-12">
               <a
                  href="/products"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200"
               >
                  View All Products
               </a>
            </div>
         </div>
      </section>
   )
}
