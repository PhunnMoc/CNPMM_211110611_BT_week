import { Suspense } from 'react'
import { Hero } from '@/components/Hero'
import { FeaturedProducts } from '@/components/FeaturedProducts'
import { Categories } from '@/components/Categories'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function Home() {
   return (
      <div className="min-h-screen bg-gray-50">
         <Hero />
         <Suspense fallback={
            <div className="glass-card p-8 m-4">
               <LoadingSpinner text="Loading featured products..." size="lg" />
            </div>
         }>
            <FeaturedProducts />
         </Suspense>
         <Categories />
      </div>
   )
}
