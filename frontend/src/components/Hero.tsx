import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'

export function Hero() {
   return (
      <section className="bg-cosmic text-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
               <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Discover Amazing Products
               </h1>
               <p className="text-xl md:text-2xl mb-8 text-white/80">
                  Shop the latest trends and find everything you need in one place
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                     href="/products"
                     className="inline-flex items-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                     <ShoppingBag className="mr-2 h-5 w-5" />
                     Shop Now
                     <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                     href="/categories"
                     className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors duration-200"
                  >
                     Browse Categories
                  </Link>
               </div>
            </div>
         </div>
      </section>
   )
}
