export interface ForecastDay {
  date: string
  aqi: number
  level: string
}

export interface Location {
  id: string
  name: string
  lat: number
  lng: number
  aqi: number
  status: 'good' | 'moderate' | 'unhealthy' | 'hazardous'
  description: string
  // Real-time fields populated from API
  pm25?: number
  pm10?: number
  humidity?: number
  temperature?: number
  updateTime?: string
  forecast?: number[]
  forecast7d?: ForecastDay[]
}

export const locations: Location[] = [
  {
    id: '1',
    name: 'Kuala Lumpur',
    lat: 3.139,
    lng: 101.687,
    aqi: 214.78,
    status: 'hazardous',
    description: 'Air quality is hazardous. Consider staying indoors and using air purifiers!',
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

export function getStatusColor(status: string): string {
  switch (status) {
    case 'good':
      return '#4ade80'
    case 'moderate':
      return '#facc15'
    case 'unhealthy':
      return '#fb923c'
    case 'hazardous':
      return '#ef4444'
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
  if (l.includes('unhealthy')) return 'unhealthy'
  if (l === 'very unhealthy' || l === 'hazardous') return 'hazardous'
  return 'moderate'
}

export function getStatusDescription(status: Location['status']): string {
  switch (status) {
    case 'good':      return 'Air quality is good. Enjoy outdoor activities!'
    case 'moderate':  return 'Air quality is moderate. Sensitive groups should limit prolonged outdoor exertion.'
    case 'unhealthy': return 'Air quality is unhealthy. Consider reducing outdoor activities.'
    case 'hazardous': return 'Air quality is hazardous. Avoid outdoor activities.'
    default:          return 'Air quality data unavailable.'
  }
}

