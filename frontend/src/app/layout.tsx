import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import ConditionalLayout from '@/components/ConditionalLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
   title: 'Shopping Website',
   description: 'A modern e-commerce platform built with Next.js',
}

export default function RootLayout({
   children,
}: {
   children: React.ReactNode
}) {
   return (
      <html lang="en">
         <body className={inter.className}>
            <Providers>
               <ConditionalLayout>
                  {children}
               </ConditionalLayout>
               <Toaster position="top-right" />
            </Providers>
         </body>
      </html>
   )
}
