export interface ForecastDay {
  date: string  // maps from pm25Forecast.day
  aqi:  number  // maps from pm25Forecast.avg
}

export interface Location {
  id: string
  name: string
  lat: number
  lng: number
  aqi: number
  status: 'good' | 'moderate' | 'unhealthy' | 'very-unhealthy' | 'hazardous'
  description: string
  // Real-time fields populated from API
  pm25?:           number
  pm10?:           number
  humidity?:       number
  temperature?:    number
  updateTime?:     string
  recommendation?: string
  forecast?:       number[]
  forecast7d?:     ForecastDay[]
}

export const locations: Location[] = [
  {
    id: '1',
    name: 'Kuala Lumpur',
    lat: 3.139,
    lng: 101.687,
    aqi: 214.78,
    status: 'very-unhealthy',
    description: 'Air quality is very unhealthy. Avoid outdoor activities.',
  },
  {
    id: '2',
    name: 'Penang',
    lat: 5.414,
    lng: 100.329,
    aqi: 25.38,
    status: 'good',
    description: 'Air quality is very good. Enjoy your day outdoors!',
  },
  {
    id: '3',
    name: 'Johor Bahru',
    lat: 1.492,
    lng: 103.742,
    aqi: 156.23,
    status: 'unhealthy',
    description: 'Air quality is unhealthy. Consider staying indoors.',
  },
  {
    id: '4',
    name: 'Ipoh',
    lat: 4.597,
    lng: 101.09,
    aqi: 89.45,
    status: 'moderate',
    description:
      'Air quality is moderate. Sensitive groups should limit prolonged outdoor exertion.',
  },
  {
    id: '5',
    name: 'Kota Kinabalu',
    lat: 5.979,
    lng: 116.075,
    aqi: 45.67,
    status: 'good',
    description: 'Air quality is excellent. Perfect day for outdoor activities!',
  },
  {
    id: '6',
    name: 'Kuching',
    lat: 1.553,
    lng: 110.359,
    aqi: 178.92,
    status: 'unhealthy',
    description: 'Air quality is poor. Everyone should reduce outdoor activities.',
  },
  {
    id: '7',
    name: 'Melaka',
    lat: 2.189,
    lng: 102.251,
    aqi: 112.34,
    status: 'moderate',
    description: 'Air quality is acceptable. Some pollutants may be present.',
  },
  {
    id: '8',
    name: 'Putrajaya',
    lat: 2.926,
    lng: 101.696,
    aqi: 67.89,
    status: 'moderate',
    description: 'Air quality is satisfactory with little to no risk.',
  },
]

// AC 1.2.1: 0–50 Green, 51–100 Yellow, 101–200 Orange, 201–300 Red, >300 Dark red
export function getStatusColor(status: string): string {
  switch (status) {
    case 'good':
      return '#059669'
    case 'moderate':
      return '#eab308'
    case 'unhealthy':
      return '#ea580c'
    case 'very-unhealthy':
      return '#dc2626'
    case 'hazardous':
      return '#7f1d1d'
    default:
      return '#9ca3af'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'good':
      return 'Good'
    case 'moderate':
      return 'Moderate'
    case 'unhealthy':
      return 'Unhealthy'
    case 'very-unhealthy':
      return 'Very Unhealthy'
    case 'hazardous':
      return 'Hazardous'
    default:
      return 'Unknown'
  }
}

export function levelToStatus(level: string): Location['status'] {
  const l = level.toLowerCase()
  if (l === 'good') return 'good'
  if (l === 'moderate') return 'moderate'
  if (l === 'very unhealthy' || l === 'very-unhealthy') return 'very-unhealthy'
  if (l === 'unhealthy') return 'unhealthy'
  if (l === 'hazardous') return 'hazardous'
  return 'moderate'
}

export function getStatusDescription(status: Location['status']): string {
  switch (status) {
    case 'good':           return 'Air quality is good. Enjoy outdoor activities!'
    case 'moderate':       return 'Air quality is moderate. Sensitive groups should limit prolonged outdoor exertion.'
    case 'unhealthy':      return 'Air quality is unhealthy. Consider reducing outdoor activities.'
    case 'very-unhealthy': return 'Air quality is very unhealthy. Avoid outdoor activities.'
    case 'hazardous':      return 'Air quality is hazardous. Stay indoors when possible.'
    default:               return 'Air quality data unavailable.'
  }
}

