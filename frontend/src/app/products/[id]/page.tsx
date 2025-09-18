"use client"

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SmartImage } from '@/components/SmartImage'
import { ImageOff, Minus, Plus } from 'lucide-react'
import { useCartAPI } from '@/hooks/useCartAPI'
import { LoadingSpinner, LoadingButton } from '@/components/LoadingSpinner'

interface ProductDetailApi {
   id: number
   name: string
   description: string
   price: number | string
   discount_price?: number | string | null
   category_id: number
   category_name?: string
   stock_quantity?: number
   images: { id: number; image_url: string; alt_text?: string; is_primary: number; sort_order: number }[]
}

export default function ProductDetailPage() {
   const { id } = useParams()
   const router = useRouter()
   const [data, setData] = useState<ProductDetailApi | null>(null)
   const [loading, setLoading] = useState(true)
   const [active, setActive] = useState(0)
   const [qty, setQty] = useState(1)
   const { addItem } = useCartAPI()

   useEffect(() => {
      if (!id) return
      const controller = new AbortController()
      async function load() {
         try {
            setLoading(true)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, { signal: controller.signal })
            if (!res.ok) throw new Error('Failed to load product')
            const json = await res.json()
            setData(json)
         } catch (e) {
            if (e instanceof DOMException && e.name === 'AbortError') {
               // ignore abort on unmount/navigation
            } else {
               console.error(e)
            }
         } finally {
            setLoading(false)
         }
      }
      load()
      return () => controller.abort()
   }, [id])

   const price = useMemo(() => Number(data?.discount_price ?? data?.price ?? 0), [data])

   async function addToCart() {
      if (!data) return
      await addItem({
         id: data.id,
         name: data.name,
         price,
         image: data.images?.[0]?.image_url || null,
         stock: data.stock_quantity || 100
      }, qty)
   }

   return (
      <div className="min-h-screen bg-cosmic">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
            <div className="flex items-center justify-between mb-6">
               <Link href="/products" className="btn-primary rounded-full">Back to products</Link>
               <Link href="/" className="btn-primary rounded-full">Home</Link>
            </div>

            {loading || !data ? (
               <div className="glass-card p-8">
                  <LoadingSpinner text="Loading product..." size="lg" />
               </div>
            ) : (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                     <div className="glass-card overflow-hidden">
                        <div className="relative h-96">
                           {data.images?.[active]?.image_url ? (
                              <SmartImage src={data.images[active].image_url} alt={data.images[active].alt_text || data.name} fill className="object-cover" sizes="100vw" />
                           ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                 <ImageOff className="h-8 w-8 text-gray-400" />
                              </div>
                           )}
                        </div>
                     </div>
                     {data.images?.length ? (
                        <div className="grid grid-cols-4 gap-2 mt-3">
                           {data.images.map((img, i) => (
                              <button key={img.id} onClick={() => setActive(i)} className={`relative h-20 rounded overflow-hidden border ${i === active ? 'border-primary-600' : 'border-white/20'}`}>
                                 {img.image_url ? (
                                    <SmartImage src={img.image_url} alt={img.alt_text || data.name} fill className="object-cover" sizes="25vw" />
                                 ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                       <ImageOff className="h-6 w-6 text-gray-400" />
                                    </div>
                                 )}
                              </button>
                           ))}
                        </div>
                     ) : null}
                  </div>
                  <div>
                     <h1 className="text-3xl font-bold mb-2">{data.name}</h1>
                     <p className="text-white/80 mb-4">{data.description}</p>
                     <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl font-bold">${price.toFixed(2)}</span>
                        {data.discount_price && (
                           <span className="text-white/60 line-through">${Number(data.price).toFixed(2)}</span>
                        )}
                     </div>

                     <div className="flex items-center gap-4 mb-2">
                        <div className="inline-flex items-center bg-white/10 border border-white/20 rounded-full">
                           <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2"><Minus className="h-4 w-4" /></button>
                           <span className="px-4">{qty}</span>
                           <button onClick={() => setQty((q) => q + 1)} className="p-2"><Plus className="h-4 w-4" /></button>
                        </div>
                        <LoadingButton
                           onClick={addToCart}
                           className="btn-primary rounded-full"
                        >
                           Add to cart
                        </LoadingButton>
                     </div>
                     {typeof data.stock_quantity === 'number' && (
                        <div className="mb-6 text-white/80">In stock: <span className="text-white">{data.stock_quantity}</span></div>
                     )}

                     {data.category_name && (
                        <div className="text-white/80">Category: <span className="text-white">{data.category_name}</span></div>
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>
   )
}


