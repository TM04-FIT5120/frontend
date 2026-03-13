import { useQueries } from '@tanstack/react-query'
import { locations as staticLocations } from '@/data/locations'
import { fetchAirQualityByCity, apiDataToLocation } from '@/api/api'
import type { Location } from '@/data/locations'

export function useLocations() {
  const results = useQueries({
    queries: staticLocations.map(loc => ({
      queryKey: ['location', loc.name],
      queryFn: () => fetchAirQualityByCity(loc.name).then(data => apiDataToLocation(loc, data)),
      retry: 1,
      staleTime: 5 * 60 * 1000,
    })),
  })

  const isLoading = results.some(r => r.isLoading)
  // Fall back to static data while loading or on error
  const locations: Location[] = results.map((r, i) => r.data ?? staticLocations[i])

  return { locations, isLoading }
}
