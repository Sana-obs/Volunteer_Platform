// Setup: Single shared QueryClient instance for consistent caching behavior
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Freshness: Keep data fresh for 1 minute before auto‑refetch
      staleTime: 60 * 1000,

      // Retry Policy: Only retry failed requests once
      retry: 1,

      // UX: Disable auto‑refetch when window regains focus
      refetchOnWindowFocus: false,
    },
  },
})
