import { useEffect, useRef } from 'react'

type Options = {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  threshold?: number
  rootMargin?: string
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 0.01,
  rootMargin = '600px 0px 600px 0px',
}: Options) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const callbackRef = useRef(onLoadMore)

  // Keep latest callback
  useEffect(() => {
    callbackRef.current = onLoadMore
  }, [onLoadMore])

  // IntersectionObserver
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting && hasMore && !isLoading) {
          callbackRef.current()
        }
      },
      { threshold, root: null, rootMargin }
    )

    const node = sentinelRef.current
    if (node) {
      observerRef.current.observe(node)
      // If already in viewport, trigger once
      const rect = node.getBoundingClientRect()
      const viewportH = window.innerHeight || document.documentElement.clientHeight
      if (rect.top <= viewportH && hasMore && !isLoading) {
        callbackRef.current()
      }
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [hasMore, isLoading, threshold, rootMargin])

  // Fallback: window scroll near-bottom detection (for browsers blocking IO)
  useEffect(() => {
    function onScroll() {
      if (!hasMore || isLoading) return
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200
      if (nearBottom) {
        callbackRef.current()
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hasMore, isLoading])

  return { sentinelRef }
}


