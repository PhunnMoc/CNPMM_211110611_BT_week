"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { User, Mail, Lock, Phone } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { LoadingButton } from '@/components/LoadingSpinner'

export default function SignUpPage() {
   const router = useRouter()
   const [username, setUsername] = useState("")
   const [firstName, setFirstName] = useState("")
   const [lastName, setLastName] = useState("")
   const [email, setEmail] = useState("")
   const [password, setPassword] = useState("")
   const [confirmPassword, setConfirmPassword] = useState("")
   const [phone, setPhone] = useState("")
   const { register, isLoading } = useAuth()

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault()
      if (!username || !firstName || !lastName || !email || !password) {
         toast.error("Please fill all required fields")
         return
      }
      if (username.length < 3) {
         toast.error("Username must be at least 3 characters")
         return
      }
      if (password !== confirmPassword) {
         toast.error("Passwords do not match")
         return
      }
      try {
         await register({ username, email, password, firstName, lastName, phone: phone || undefined })
         router.push('/')
      } catch (err: unknown) {
         // Error handling is done in the useAuth hook
      }
   }

   return (
      <div className="min-h-screen bg-cosmic flex items-center justify-center px-4">
         <div className="relative w-full max-w-md">
            <div className="absolute inset-0 blur-3xl bg-gradient-to-br from-primary-700/20 via-purple-600/10 to-fuchsia-600/10 rounded-3xl" />
            <div className="relative glass-card p-8 text-white">
               <h1 className="text-3xl font-bold text-center mb-6">Create account</h1>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                     <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500">
                        <User className="h-5 w-5 text-white/80" />
                        <input
                           type="text"
                           value={username}
                           onChange={(e) => setUsername(e.target.value)}
                           className="w-full bg-transparent outline-none placeholder-white/60"
                           placeholder="Username"
                        />
                     </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     <div>
                        <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500">
                           <User className="h-5 w-5 text-white/80" />
                           <input
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="w-full bg-transparent outline-none placeholder-white/60"
                              placeholder="First name"
                           />
                        </div>
                     </div>
                     <div>
                        <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500">
                           <User className="h-5 w-5 text-white/80" />
                           <input
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="w-full bg-transparent outline-none placeholder-white/60"
                              placeholder="Last name"
                           />
                        </div>
                     </div>
                  </div>
                  <div>
                     <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500">
                        <Mail className="h-5 w-5 text-white/80" />
                        <input
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full bg-transparent outline-none placeholder-white/60"
                           placeholder="you@example.com"
                        />
                     </div>
                  </div>
                  <div>
                     <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500">
                        <Phone className="h-5 w-5 text-white/80" />
                        <input
                           type="tel"
                           value={phone}
                           onChange={(e) => setPhone(e.target.value)}
                           className="w-full bg-transparent outline-none placeholder-white/60"
                           placeholder="Phone (optional)"
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
                  <div>
                     <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500">
                        <Lock className="h-5 w-5 text-white/80" />
                        <input
                           type="password"
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           className="w-full bg-transparent outline-none placeholder-white/60"
                           placeholder="Confirm password"
                        />
                     </div>
                  </div>
                  <LoadingButton
                     type="submit"
                     isLoading={isLoading}
                     loadingText="Creating account..."
                     className="w-full btn-primary rounded-full justify-center"
                  >
                     Create account
                  </LoadingButton>
               </form>
               <p className="text-center text-sm text-white/80 mt-4">
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="text-primary-300 hover:underline">Sign In</Link>
               </p>
            </div>
         </div>
      </div>
   )
}


