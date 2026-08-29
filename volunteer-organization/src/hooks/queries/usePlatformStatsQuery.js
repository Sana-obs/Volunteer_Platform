import { useQuery } from '@tanstack/react-query'
import { fetchPlatformStats } from '../../services/stats'
import { queryKeys } from '../../app/queryKeys'

// Service resolves { success, data/error } without throwing; the page validates.
export function usePlatformStatsQuery() {
  return useQuery({
    queryKey: queryKeys.stats.platform,
    queryFn: fetchPlatformStats,
  })
}