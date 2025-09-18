"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader } from '@/components/Loader'

interface Category {
   id: number
   name: string
   description?: string
   image?: string
   product_count: number
   children?: Category[]
}

export default function CategoriesPage() {
   const [categories, setCategories] = useState<Category[]>([])
   const [loading, setLoading] = useState(true)

   useEffect(() => {
      const controller = new AbortController()
      async function loadCategories() {
         try {
            setLoading(true)
            const res = await fetch(`/api/categories`, { signal: controller.signal })
            if (!res.ok) throw new Error('Failed to load categories')
            const data = await res.json()
            setCategories(data)
         } catch (e) {
            if (!(e instanceof DOMException)) console.error(e)
         } finally {
            setLoading(false)
         }
      }
      loadCategories()
      return () => controller.abort()
   }, [])

   const renderCategory = (category: Category) => (
      <Link
         key={category.id}
         href={`/categories/${category.id}`}
         className="glass-card p-6 hover:bg-white/10 transition-colors group"
      >
         <div className="flex items-center gap-4">
            {category.image ? (
               <Image
                  src={category.image}
                  alt={category.name}
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                  unoptimized
                  loader={({ src }) => src}
               />
            ) : (
               <div className="w-15 h-15 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="text-white/60 text-lg font-bold">
                     {category.name.charAt(0).toUpperCase()}
                  </span>
               </div>
            )}
            <div className="flex-1">
               <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                  {category.name}
               </h3>
               {category.description && (
                  <p className="text-white/70 text-sm mt-1">{category.description}</p>
               )}
               <p className="text-white/60 text-xs mt-2">
                  {category.product_count} products
               </p>
            </div>
            <div className="text-white/40 group-hover:text-white/60 transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
               </svg>
            </div>
         </div>
      </Link>
   )

   const renderCategoriesWithChildren = (categories: Category[]) => {
      return categories.map(category => (
         <div key={category.id}>
            {renderCategory(category)}
            {category.children && category.children.length > 0 && (
               <div className="ml-8 mt-4 space-y-3">
                  {category.children.map(child => renderCategory(child))}
               </div>
            )}
         </div>
      ))
   }

   return (
      <div className="min-h-screen bg-cosmic">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-8 text-white">
               <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Categories</h1>
                  <p className="text-white/70 mt-2">Browse products by category</p>
               </div>
               <Link href="/products" className="btn-primary rounded-full">All Products</Link>
            </div>

            {loading ? (
               <Loader />
            ) : (
               <div className="space-y-4">
                  {categories.length === 0 ? (
                     <div className="text-center text-white/60 py-12">
                        <p className="text-lg">No categories found</p>
                     </div>
                  ) : (
                     renderCategoriesWithChildren(categories)
                  )}
               </div>
            )}
         </div>
      </div>
   )
}
