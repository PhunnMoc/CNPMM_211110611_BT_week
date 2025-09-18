interface LoadingSpinnerProps {
   size?: 'sm' | 'md' | 'lg'
   text?: string
   className?: string
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
   const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
   }

   return (
      <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
         <div className={`animate-spin rounded-full border-2 border-white/20 border-t-white ${sizeClasses[size]}`} />
         {text && (
            <p className="text-white/80 text-sm font-medium animate-pulse">
               {text}
            </p>
         )}
      </div>
   )
}

interface LoadingOverlayProps {
   isLoading: boolean
   text?: string
   children: React.ReactNode
}

export function LoadingOverlay({ isLoading, text, children }: LoadingOverlayProps) {
   return (
      <div className="relative">
         {children}
         {isLoading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
               <LoadingSpinner text={text} />
            </div>
         )}
      </div>
   )
}

interface LoadingButtonProps {
   isLoading: boolean
   loadingText?: string
   children: React.ReactNode
   className?: string
   disabled?: boolean
   onClick?: () => void
   type?: 'button' | 'submit' | 'reset'
}

export function LoadingButton({
   isLoading,
   loadingText = 'Loading...',
   children,
   className = '',
   disabled = false,
   onClick,
   type = 'button'
}: LoadingButtonProps) {
   return (
      <button
         type={type}
         onClick={onClick}
         disabled={disabled || isLoading}
         className={`relative ${className} ${(disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
         {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
            </div>
         )}
         <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
            {isLoading ? loadingText : children}
         </span>
      </button>
   )
}
