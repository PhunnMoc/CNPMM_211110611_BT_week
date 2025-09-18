"use client"

import Image, { ImageProps } from 'next/image'
import { ImageOff } from 'lucide-react'

type Props = Omit<ImageProps, 'loader'> & {
   fallbackClassName?: string
}

export function SmartImage({ src, alt, className, fallbackClassName, ...rest }: Props) {
   if (!src || typeof src !== 'string') {
      return (
         <div className={fallbackClassName || 'flex items-center justify-center bg-gray-100'}>
            <ImageOff className="h-8 w-8 text-gray-400" />
         </div>
      )
   }

   return (
      <Image
         src={src}
         alt={alt}
         className={className}
         unoptimized
         loader={({ src }) => src}
         {...rest}
      />
   )
}


