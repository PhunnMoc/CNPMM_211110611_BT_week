'use client'

import { useSelector } from 'react-redux'
import { selectIsLoading, selectLoadingMessage } from '@/store/slices/uiSlice'
import { LoadingSpinner } from './LoadingSpinner'
import type { RootState } from '@/store'

export function ApiLoadingOverlay() {
   const pendingCount = useSelector((state: RootState) => {
      const apiState: any = (state as any).api
      let count = 0
      if (apiState?.queries) {
         for (const q of Object.values(apiState.queries) as any[]) {
            const status = q?.status || q?.fetchStatus
            if (status === 'pending' || status === 'loading') count++
         }
      }
      if (apiState?.mutations) {
         for (const m of Object.values(apiState.mutations) as any[]) {
            const status = m?.status || m?.fetchStatus
            if (status === 'pending' || status === 'loading') count++
         }
      }
      return count
   })
   const uiIsLoading = useSelector(selectIsLoading)
   const uiMessage = useSelector(selectLoadingMessage)

   const visible = pendingCount > 0 || uiIsLoading
   const text = uiMessage || (pendingCount > 0 ? 'Loading...' : undefined)

   if (!visible) return null

   return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
         <LoadingSpinner text={text} size="lg" />
      </div>
   )
}


