"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { User as UserIcon } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import { LoadingSpinner, LoadingButton } from '@/components/LoadingSpinner'
import { showToast } from '@/utils/toast'

interface ProfileData {
   id: number
   username: string
   email: string
   first_name?: string
   last_name?: string
   phone?: string
   created_at?: string
   updated_at?: string
}

export default function ProfilePage() {
   const router = useRouter()
   const { token, user, updateAvatar, isAuthenticated } = useAuth()
   const [loading, setLoading] = useState(true)
   const [profile, setProfile] = useState<ProfileData | null>(null)

   const [firstName, setFirstName] = useState("")
   const [lastName, setLastName] = useState("")
   const [phone, setPhone] = useState("")
   const [saving, setSaving] = useState(false)
   const [avatarUploading, setAvatarUploading] = useState(false)

   useEffect(() => {
      if (!isAuthenticated) {
         router.push('/auth/signin')
         return
      }
      const fetchProfile = async () => {
         try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
               headers: { Authorization: `Bearer ${token}` },
               credentials: 'include',
            })
            if (!res.ok) {
               throw new Error('Failed to load profile')
            }
            const data: ProfileData = await res.json()
            setProfile(data)
            setFirstName((data as any).first_name || '')
            setLastName((data as any).last_name || '')
            setPhone((data as any).phone || '')
         } catch (e) {
            showToast.error('Could not fetch profile')
         } finally {
            setLoading(false)
         }
      }
      fetchProfile()
   }, [token, router, isAuthenticated])

   async function saveProfile(e: React.FormEvent) {
      e.preventDefault()
      if (!token) return
      try {
         setSaving(true)
         const payload: Record<string, unknown> = { firstName, lastName }
         if (phone.trim()) payload.phone = phone
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
            credentials: 'include',
         })
         if (!res.ok) {
            let message = 'Failed to save profile'
            try {
               const data = await res.json()
               if (data?.errors?.length) message = data.errors.map((e: any) => e.msg).join('\n')
               else if (data?.message) message = data.message
            } catch { }
            throw new Error(message)
         }
         showToast.success('Profile updated')
      } catch (err: unknown) {
         showToast.error(err instanceof Error ? err.message : 'Save failed')
      } finally {
         setSaving(false)
      }
   }

   async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0]
      if (!file || !token) return
      if (!file.type.startsWith('image/')) {
         toast.error('Please select an image file')
         return
      }
      if (file.size > 2 * 1024 * 1024) {
         toast.error('Image too large. Please choose a file under 2MB')
         return
      }
      try {
         setAvatarUploading(true)
         // simple base64 upload; backend should accept string data url on /users/profile with avatarUrl
         const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
         })
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ avatarUrl: base64 }),
            credentials: 'include',
         })
         if (!res.ok) {
            throw new Error('Failed to upload avatar')
         }
         updateAvatar(base64)
         showToast.success('Avatar updated')
      } catch (err: unknown) {
         showToast.error(err instanceof Error ? err.message : 'Upload failed')
      } finally {
         setAvatarUploading(false)
      }
   }

   if (loading) {
      return <div className="min-h-screen bg-cosmic px-4 py-10 text-white/80">Loading…</div>
   }
   if (!token) return null

   return (
      <div className="min-h-screen bg-cosmic px-4 py-10">
         <div className="max-w-3xl mx-auto">
            <div className="glass-card p-6 md:p-8 text-white">
               <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
                  <Link href="/" className="btn-primary rounded-full inline-flex items-center gap-2">
                     <ArrowLeft className="h-4 w-4" />
                     Home
                  </Link>
               </div>

               {loading ? (
                  <div className="text-white/80">Loading...</div>
               ) : (
                  <form onSubmit={saveProfile} className="space-y-5">
                     <div className="flex items-center gap-4 mb-2">
                        {user?.avatarUrl ? (
                           <img
                              src={user.avatarUrl}
                              alt="avatar"
                              className="h-16 w-16 rounded-full object-cover ring-2 ring-white/30"
                           />
                        ) : (
                           <div className="h-16 w-16 rounded-full ring-2 ring-white/30 bg-white/10 flex items-center justify-center">
                              <UserIcon className="h-8 w-8 text-white/70" />
                           </div>
                        )}
                        <label className="btn-primary rounded-full cursor-pointer">
                           <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
                           {avatarUploading ? 'Uploading…' : 'Change Avatar'}
                        </label>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm mb-1 text-white/80">Username</label>
                           <input
                              disabled
                              value={profile?.username || user?.username || ''}
                              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                           />
                        </div>
                        <div>
                           <label className="block text-sm mb-1 text-white/80">Email</label>
                           <input
                              disabled
                              value={profile?.email || user?.email || ''}
                              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                           />
                        </div>
                        <div>
                           <label className="block text-sm mb-1 text-white/80">First name</label>
                           <input
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
                              placeholder="First name"
                           />
                        </div>
                        <div>
                           <label className="block text-sm mb-1 text-white/80">Last name</label>
                           <input
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
                              placeholder="Last name"
                           />
                        </div>
                        <div className="sm:col-span-2">
                           <label className="block text-sm mb-1 text-white/80">Phone</label>
                           <input
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
                              placeholder="Phone"
                           />
                        </div>
                     </div>
                     <div className="flex justify-end">
                        <LoadingButton
                           type="submit"
                           isLoading={saving}
                           loadingText="Saving..."
                           className="btn-primary rounded-full justify-center"
                        >
                           Save changes
                        </LoadingButton>
                     </div>
                  </form>
               )}
            </div>
         </div>
      </div>
   )
}


