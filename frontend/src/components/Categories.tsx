'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { SmartImage } from './SmartImage'
import { ImageOff } from 'lucide-react'
import { Loader } from './Loader'

interface Category {
   id: number
   name: string
   description: string
   image: string
   productCount: number
}

async function fetchCategories(): Promise<Category[]> {
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
   if (!response.ok) {
      throw new Error('Failed to fetch categories')
   }
   return response.json()
}

export function Categories() {
   const { data: categories, isLoading, error } = useQuery({
      queryKey: ['categories'],
      queryFn: fetchCategories,
   })

   if (isLoading) return <Loader />
   if (error) return <div>Error loading categories</div>

   return (
      <section className="py-16 bg-gray-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Shop by Category
               </h2>
               <p className="text-lg text-gray-600">
                  Find exactly what you're looking for
               </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {categories?.map((category) => (
                  <Link
                     key={category.id}
                     href={`/categories/${category.id}`}
                     className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                     <div className="relative h-48">
                        {category.image ? (
                           // Using SmartImage with fill via sizes and unoptimized
                           <SmartImage
                              src={category.image}
                              alt={category.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                           />
                        ) : (
                           <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <ImageOff className="h-8 w-8 text-gray-400" />
                           </div>
                        )}
                     </div>
                     <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                           {category.name}
                        </h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">
                           {category.description}
                        </p>
                        <p className="text-sm text-primary-600 font-medium">
                           {category.productCount} products
                        </p>
                     </div>
                  </Link>
               ))}
            </div>
         </div>
      </section>
   )
}
