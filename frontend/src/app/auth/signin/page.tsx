"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { User, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { LoadingButton } from '@/components/LoadingSpinner'

export default function SignInPage() {
   const router = useRouter()
   const [email, setEmail] = useState("")
   const [password, setPassword] = useState("")
   const { login, isLoading } = useAuth()

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      if (!email || !password) {
         toast.error("Please enter email and password")
         return
      }
      try {
         const result = await login(email, password)
         // Redirect based on user role
         if (result.user.isAdmin) {
            router.push('/admin')
         } else {
            router.push('/')
         }
      } catch (err: unknown) {
         // Error handling is done in the useAuth hook
      }
   }

   return (
      <div className="min-h-screen bg-cosmic flex items-center justify-center px-4">
         <div className="relative w-full max-w-md">
            <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-primary-700/20 via-purple-600/10 to-fuchsia-600/10 rounded-3xl" />
            <div className="relative glass-card p-8 text-white">
               <h1 className="text-3xl font-bold text-center mb-6">Login</h1>

               <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                     <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500">
                        <User className="h-5 w-5 text-white/80" />
                        <input
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full bg-transparent outline-none placeholder-white/60"
                           placeholder="Username or email"
                        />
                     </div>
                  </div>
                  <div>
                     <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500">
                        <Lock className="h-5 w-5 text-white/80" />
                        <input
                           type="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full bg-transparent outline-none placeholder-white/60"
                           placeholder="Password"
                        />
                     </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-white/80">
                     <label className="inline-flex items-center gap-2">
                        <input type="checkbox" className="rounded bg-transparent border-white/30" />
                        Remember me
                     </label>
                     <Link href="#" className="hover:underline">Forgot password?</Link>
                  </div>

                  <LoadingButton
                     type="submit"
                     isLoading={isLoading}
                     loadingText="Signing in..."
                     className="w-full btn-primary rounded-full justify-center"
                  >
                     Login
                  </LoadingButton>
               </form>

               <p className="text-center text-sm text-white/80 mt-4">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/signup" className="text-primary-300 hover:underline">Register</Link>
               </p>
            </div>
         </div>
      </div>
   )
}


