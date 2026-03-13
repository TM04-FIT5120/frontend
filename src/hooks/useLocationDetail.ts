import { useQuery } from '@tanstack/react-query'
import { locations as staticLocations } from '@/data/locations'
import { fetchAirQualityByCity, apiDataToLocation } from '@/api/api'
import type { Location } from '@/data/locations'

export function useLocationDetail(cityName: string) {
  const staticLoc = staticLocations.find(l => l.name === cityName)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['location', cityName],
    queryFn: () =>
      fetchAirQualityByCity(cityName).then(apiData =>
        staticLoc ? apiDataToLocation(staticLoc, apiData) : null
      ),
    enabled: !!cityName,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

  // Fall back to static data on error or while loading
  const location: Location | null = data ?? staticLoc ?? null

  return { location, isLoading, isError }
}
