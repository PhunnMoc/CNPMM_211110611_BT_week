'use client'

// import Image from 'next/image'
import { SmartImage } from './SmartImage'
import { ImageOff } from 'lucide-react'
import Link from 'next/link'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { useCartAPI } from '@/hooks/useCartAPI'
import { showToast } from '@/utils/toast'

interface Product {
   id: number
   name: string
   price: number
   discountPrice?: number
   image: string
   rating: number
   reviewCount: number
}

interface ProductCardProps {
   product: Product
}

export function ProductCard({ product }: ProductCardProps) {
   const { addItem } = useCartAPI()

   const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      addItem({
         id: product.id,
         name: product.name,
         price: product.price,
         image: product.image,
         stock: 100, // Default stock, should come from product data
      })
   }

   const handleAddToWishlist = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      showToast.info('Wishlist functionality coming soon!')
   }

   const priceNumber = Number(product.price)
   const discountNumber = product.discountPrice !== undefined && product.discountPrice !== null
      ? Number(product.discountPrice)
      : null
   const hasDiscount = typeof discountNumber === 'number' && !isNaN(discountNumber) && discountNumber < priceNumber
   const displayPrice = hasDiscount ? discountNumber! : priceNumber

   return (
      <Link href={`/products/${product.id}`} className="product-card group glass-card overflow-hidden">
         <div className="relative">
            {product.image ? (
               <SmartImage
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
               />
            ) : (
               <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                  <ImageOff className="h-8 w-8 text-gray-400" />
               </div>
            )}
            {hasDiscount && (
               <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                  Sale
               </div>
            )}
            <button
               onClick={handleAddToWishlist}
               className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50"
            >
               <Heart className="h-4 w-4 text-gray-600" />
            </button>
         </div>

         <div className="p-4 bg-white">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
               {product.name}
            </h3>

            <div className="flex items-center mb-2">
               <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                     <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.rating)
                           ? 'text-yellow-400 fill-current'
                           : 'text-gray-300'
                           }`}
                     />
                  ))}
               </div>
               <span className="text-sm text-gray-600 ml-2">
                  ({product.reviewCount})
               </span>
            </div>

            <div className="flex items-center justify-between mb-3">
               <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-gray-900">
                     ${Number.isFinite(displayPrice) ? displayPrice.toFixed(2) : '0.00'}
                  </span>
                  {hasDiscount && (
                     <span className="text-sm text-gray-500 line-through">
                        ${Number.isFinite(priceNumber) ? priceNumber.toFixed(2) : '0.00'}
                     </span>
                  )}
               </div>
            </div>

            <button
               onClick={handleAddToCart}
               className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
               <ShoppingCart className="h-4 w-4" />
               <span>Add to Cart</span>
            </button>
         </div>
      </Link>
   )
}
