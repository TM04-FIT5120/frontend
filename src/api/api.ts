import { levelToStatus, getStatusDescription } from '@/data/locations'
import type { Location, ForecastDay } from '@/data/locations'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

interface ApiCurrentData {
  aqi: number
  level: string
  pm25: number
  pm10: number
  humidity: number
  temperature: number
  updateTime: string
}

export interface ApiData {
  city: string
  current: ApiCurrentData
  forecast7d: ForecastDay[]
}

// Fetch by coordinates — used for "My Location" feature
// GET /api/air/quality?latitude=xx&longitude=xx
export async function fetchAirQualityByCoords(latitude: number, longitude: number): Promise<ApiData> {
  const res = await fetch(`${BASE_URL}/api/air/quality?latitude=${latitude}&longitude=${longitude}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  if (json.code !== 200) throw new Error(json.msg || 'API error')
  return json.data
}

// Fetch by city name — used for search, detail, compare, favourites pages
// GET /api/air/quality/by-city?city=xxx
export async function fetchAirQualityByCity(city: string): Promise<ApiData> {
  const res = await fetch(`${BASE_URL}/api/air/quality/by-city?city=${encodeURIComponent(city)}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  if (json.code !== 200) throw new Error(json.msg || 'API error')
  return json.data
}

// Merge a static location record with live API data
export function apiDataToLocation(staticLoc: Location, apiData: ApiData): Location {
  const status = levelToStatus(apiData.current.level)
  return {
    ...staticLoc,
    name: apiData.city || staticLoc.name,
    aqi: apiData.current.aqi,
    status,
    pm25: apiData.current.pm25,
    pm10: apiData.current.pm10,
    humidity: apiData.current.humidity,
    temperature: apiData.current.temperature,
    updateTime: apiData.current.updateTime,
    description: getStatusDescription(status),
    forecast: apiData.forecast7d.map(d => d.aqi),
    forecast7d: apiData.forecast7d,
  }
}
