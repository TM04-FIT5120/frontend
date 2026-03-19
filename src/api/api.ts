import { getStatusDescription } from '@/data/locations'
import type { Location } from '@/data/locations'

// const BASE_URL = 'http://localhost:8080'
const BASE_URL = 'https://futurestack.webhop.me'

// ── Response shapes ───────────────────────────────────────────────────────────
export interface AirQualityResponse {
  aqi:               number
  cityName:          string
  dominantPollutant: string
  humidity:          number | null
  latitude:          number
  longitude:         number
  pm10:              number | null
  pm25:              number | null
  pm25Forecast:      { avg: number; day: string; max: number; min: number }[]
  pressure:          number | null
  recommendation:    string
  recordTime:        string
  temperature:       number | null
  windGust:          number | null
  windSpeed:         number | null
}

export interface FavoriteItem {
  id:        number
  cityName:  string
  latitude:  number
  longitude: number
  createdAt: string
}

export interface PredictedAqiMonth {
  month: string // e.g. "2026-04"
  predictedAqi: number
}

export interface CityAqiForecast {
  cityName: string
  predictions: PredictedAqiMonth[]
}

// Backwards-compatible alias used by existing hooks
export type ApiData = AirQualityResponse

// ── AQI → status (Malaysian API scale per AC 1.2.1) ─────────────────────────────
export function aqiToStatus(aqi: number): Location['status'] {
  if (aqi <= 50)   return 'good'
  if (aqi <= 100)  return 'moderate'
  if (aqi <= 200)  return 'unhealthy'
  if (aqi <= 300)  return 'very-unhealthy'
  return 'hazardous'
}

// ── Air quality endpoints ─────────────────────────────────────────────────────

// GET /api/airQuality/airQualityDefaut
export async function fetchDefaultAirQuality(): Promise<AirQualityResponse> {
  const res = await fetch(`${BASE_URL}/api/airQuality/airQualityDefaut`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// GET /api/airQuality/airQualityByCityOrLocation?Latitude=x&Longitude=y
export async function fetchAirQualityByCoords(latitude: number, longitude: number): Promise<AirQualityResponse> {
  const res = await fetch(`${BASE_URL}/api/airQuality/airQualityByCityOrLocation?Latitude=${latitude}&Longitude=${longitude}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// GET /api/airQuality/airQualityByCityOrLocation?city=xxx
export async function fetchAirQualityByCity(city: string): Promise<AirQualityResponse> {
  const res = await fetch(`${BASE_URL}/api/airQuality/airQualityByCityOrLocation?city=${encodeURIComponent(city)}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// GET /api/airQuality/predictedAqiNext12Months
export async function fetchPredictedAqiNext12Months(): Promise<CityAqiForecast[]> {
  const res = await fetch(`${BASE_URL}/api/airQuality/predictedAqiNext12Months`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// ── Favourites endpoints ──────────────────────────────────────────────────────

// GET /api/favorites/all
export async function fetchAllFavorites(): Promise<FavoriteItem[]> {
  const res = await fetch(`${BASE_URL}/api/favorites/all`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// POST /api/favorites/add  { cityName, latitude, longitude }
export async function addFavorite(cityName: string, latitude: number, longitude: number): Promise<FavoriteItem> {
  const res = await fetch(`${BASE_URL}/api/favorites/add`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ cityName, latitude, longitude }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// DELETE /api/favorites/delete/:id
export async function deleteFavorite(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/favorites/delete/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

// ── Geocoding (Nominatim / OpenStreetMap) ─────────────────────────────────────

export interface GeocodingSuggestion {
  place_id:     number
  display_name: string
  lat:          string
  lon:          string
  type:         string
  class:        string
  address: {
    city?:         string
    town?:         string
    village?:      string
    suburb?:       string
    neighbourhood?: string
    county?:       string
    state?:        string
    amenity?:      string
  }
}

export interface ReverseGeocodeResult {
  place_id:     number
  display_name: string
  lat:          string
  lon:          string
  address: {
    city?:    string
    town?:    string
    village?: string
    suburb?:  string
    county?:  string
    state?:   string
  }
}

// Nominatim free geocoder — Malaysia only, no API key required
export async function fetchGeocodingSuggestions(query: string): Promise<GeocodingSuggestion[]> {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(query)}` +
    `&format=json&limit=6&countrycodes=my&addressdetails=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// Reverse geocoding: lat/lon -> best-effort city-like name (city/town/village/suburb)
export async function reverseGeocodeCity(lat: number, lon: number): Promise<string | null> {
  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?lat=${encodeURIComponent(String(lat))}` +
    `&lon=${encodeURIComponent(String(lon))}` +
    `&format=json&addressdetails=1`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = (await res.json()) as ReverseGeocodeResult
  const addr = data.address || {}
  return addr.city || addr.town || addr.village || addr.suburb || null
}

// ── Data mapping helpers ──────────────────────────────────────────────────────

// Merge a static Location record with live API data (used by useLocations / useLocationDetail)
export function apiDataToLocation(staticLoc: Location, apiData: AirQualityResponse): Location {
  const status = aqiToStatus(apiData.aqi)
  return {
    ...staticLoc,
    name:           apiData.cityName || staticLoc.name,
    aqi:            apiData.aqi,
    status,
    description:    getStatusDescription(status),
    pm25:           apiData.pm25        ?? undefined,
    pm10:           apiData.pm10        ?? undefined,
    humidity:       apiData.humidity    ?? undefined,
    temperature:    apiData.temperature ?? undefined,
    updateTime:     apiData.recordTime,
    recommendation: apiData.recommendation,
    forecast7d:     apiData.pm25Forecast.map(d => ({ date: d.day, aqi: d.avg })),
    forecast:       apiData.pm25Forecast.map(d => d.avg),
  }
}

// Build a standalone Location from a raw API response (no static loc needed e.g. user coordinates)
export function airQualityToLocation(apiData: AirQualityResponse): Location {
  const status = aqiToStatus(apiData.aqi)
  return {
    id:             `live_${apiData.latitude}_${apiData.longitude}`,
    name:           apiData.cityName,
    lat:            apiData.latitude,
    lng:            apiData.longitude,
    aqi:            apiData.aqi,
    status,
    description:    getStatusDescription(status),
    pm25:           apiData.pm25        ?? undefined,
    pm10:           apiData.pm10        ?? undefined,
    humidity:       apiData.humidity    ?? undefined,
    temperature:    apiData.temperature ?? undefined,
    updateTime:     apiData.recordTime,
    recommendation: apiData.recommendation,
    forecast7d:     apiData.pm25Forecast.map(d => ({ date: d.day, aqi: d.avg })),
    forecast:       apiData.pm25Forecast.map(d => d.avg),
  }
}
