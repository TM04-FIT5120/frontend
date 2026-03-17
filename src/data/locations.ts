export interface ForecastDay {
  date: string  // maps from pm25Forecast.day
  aqi:  number  // maps from pm25Forecast.avg
}

export interface PredictedMonthlyAqi {
  month: string // e.g. "2026-04"
  aqi:   number
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
  // Long-term (12-month) predicted AQI, matched by cityName from backend
  predicted12m?:   PredictedMonthlyAqi[]
}

// Malaysian cities/locales from official air quality monitoring list. Data is fetched via fetchAirQualityByCity(name).
// Each entry is a seed; lat, lng, aqi, status, description are filled by the API.
function seed(name: string): Location {
  return {
    id: name,
    name,
    lat: 0,
    lng: 0,
    aqi: 0,
    status: 'moderate',
    description: '',
  }
}

// AQI Station List with real coordinates for geo-based AQI lookup
export const locations: Location[] = [
  { ...seed('Alor Gajah'),        lat:  2.3835, lng: 102.2108 }, // Alor Gajah, Melaka
  { ...seed('Alor Setar'),        lat:  6.1248, lng: 100.3673 }, // Alor Setar, Kedah
  { ...seed('Bakar Arang'),       lat:  5.6333, lng: 100.4667 }, // Sungai Petani, Kedah
  { ...seed('Balik Pulau'),       lat:  5.3430, lng: 100.2430 }, // Balik Pulau, Penang
  { ...seed('Balok Baru'),        lat:  3.9167, lng: 103.4333 }, // Balok, Pahang
  { ...seed('Bandaraya Melaka'),  lat:  2.1957, lng: 102.2501 }, // Melaka City, Melaka
  { ...seed('Banting'),           lat:  2.8167, lng: 101.5000 }, // Banting, Selangor
  { ...seed('Batu Muda'),         lat:  3.2167, lng: 101.6833 }, // Batu Muda, Kuala Lumpur
  { ...seed('Batu Pahat'),        lat:  1.8531, lng: 102.9325 }, // Batu Pahat, Johor
  { ...seed('Besut'),             lat:  5.7000, lng: 102.5667 }, // Besut, Terengganu
  { ...seed('Bintulu'),           lat:  3.1667, lng: 113.0333 }, // Bintulu, Sarawak
  { ...seed('Bukit Rambai'),      lat:  2.2708, lng: 102.2019 }, // Bukit Rambai, Melaka
  { ...seed('Cheras'),            lat:  3.0795, lng: 101.7290 }, // Cheras, Kuala Lumpur
  { ...seed('ILP Miri'),          lat:  4.3833, lng: 113.9833 }, // ILP Miri, Sarawak
  { ...seed('Indera Mahkota'),    lat:  3.8167, lng: 103.3333 }, // Indera Mahkota, Kuantan, Pahang
  { ...seed('Ipoh'),              lat:  4.5975, lng: 101.0901 }, // Ipoh, Perak
  { ...seed('Jalan Tasek'),       lat:  4.6333, lng: 101.1167 }, // Jalan Tasek, Ipoh, Perak
  { ...seed('Jerantut'),          lat:  3.9500, lng: 102.3667 }, // Jerantut, Pahang
  { ...seed('Kangar'),            lat:  6.4435, lng: 100.1986 }, // Kangar, Perlis
  { ...seed('Kapit'),             lat:  2.0167, lng: 112.9333 }, // Kapit, Sarawak
  { ...seed('Kemaman'),           lat:  4.2333, lng: 103.4167 }, // Kemaman, Terengganu
  { ...seed('Keningau'),          lat:  5.3333, lng: 116.1667 }, // Keningau, Sabah
  { ...seed('Kg. Air Putih'),     lat:  5.2953, lng: 115.2403 }, // Kg. Air Putih, Labuan
  { ...seed('Kimanis'),           lat:  5.5883, lng: 115.8483 }, // Kimanis, Sabah
  { ...seed('Kluang'),            lat:  2.0333, lng: 103.3167 }, // Kluang, Johor
  { ...seed('Kota Bharu'),        lat:  6.1333, lng: 102.2500 }, // Kota Bharu, Kelantan
  { ...seed('Kota Kinabalu'),     lat:  5.9804, lng: 116.0735 }, // Kota Kinabalu, Sabah
  { ...seed('Kota Tinggi'),       lat:  1.7333, lng: 103.9000 }, // Kota Tinggi, Johor
  { ...seed('Kuala Selangor'),    lat:  3.3333, lng: 101.2500 }, // Kuala Selangor, Selangor
  { ...seed('Kuala Terengganu'), lat:  5.3296, lng: 103.1370 }, // Kuala Terengganu, Terengganu
  { ...seed('Kuching'),           lat:  1.5497, lng: 110.3629 }, // Kuching, Sarawak
  { ...seed('Kulim Hi-Tech'),     lat:  5.3833, lng: 100.5667 }, // Kulim Hi-Tech Park, Kedah
  { ...seed('Labuan'),            lat:  5.2833, lng: 115.2333 }, // Labuan, Federal Territory
  { ...seed('Langkawi'),          lat:  6.3500, lng:  99.8000 }, // Langkawi, Kedah
  { ...seed('Larkin Lama'),       lat:  1.5167, lng: 103.7333 }, // Larkin, Johor Bahru
  { ...seed('Limbang'),           lat:  4.7500, lng: 115.0000 }, // Limbang, Sarawak
  { ...seed('Minden'),            lat:  5.3600, lng: 100.3000 }, // Minden, Penang (near USM)
  { ...seed('Miri'),              lat:  4.3995, lng: 113.9914 }, // Miri, Sarawak
  { ...seed('Mukah'),             lat:  2.9000, lng: 112.0833 }, // Mukah, Sarawak
  { ...seed('Nilai'),             lat:  2.8167, lng: 101.8000 }, // Nilai, Negeri Sembilan
  { ...seed('Paka'),              lat:  4.6333, lng: 103.4333 }, // Paka, Terengganu
  { ...seed('Pasir Gudang'),      lat:  1.4694, lng: 103.8975 }, // Pasir Gudang, Johor
  { ...seed('Pelabuhan Kelang'),  lat:  3.0000, lng: 101.3833 }, // Port Klang, Selangor
  { ...seed('Pengerang'),         lat:  1.3500, lng: 104.1167 }, // Pengerang, Johor
  { ...seed('Perai'),             lat:  5.3833, lng: 100.3833 }, // Perai, Penang
  { ...seed('Petaling Jaya'),     lat:  3.1073, lng: 101.6067 }, // Petaling Jaya, Selangor
  { ...seed('Port Dickson'),      lat:  2.5233, lng: 101.7981 }, // Port Dickson, Negeri Sembilan
  { ...seed('Putrajaya'),         lat:  2.9264, lng: 101.6964 }, // Putrajaya, Federal Territory
  { ...seed('Rompin'),            lat:  2.8000, lng: 103.5000 }, // Rompin, Pahang
  { ...seed('Samalaju'),          lat:  3.3500, lng: 113.0833 }, // Samalaju, Sarawak
  { ...seed('Samarahan'),         lat:  1.4500, lng: 110.4833 }, // Samarahan, Sarawak
  { ...seed('Sandakan'),          lat:  5.8333, lng: 118.1167 }, // Sandakan, Sabah
  { ...seed('Sarikei'),           lat:  2.1167, lng: 111.5167 }, // Sarikei, Sarawak
  { ...seed('Segamat'),           lat:  2.5167, lng: 102.8167 }, // Segamat, Johor
  { ...seed('Seremban'),          lat:  2.7260, lng: 101.9381 }, // Seremban, Negeri Sembilan
  { ...seed('Seri Manjung'),      lat:  4.2167, lng: 100.6500 }, // Seri Manjung, Perak
  { ...seed('Shah Alam'),         lat:  3.0738, lng: 101.5183 }, // Shah Alam, Selangor
  { ...seed('Sibu'),              lat:  2.3000, lng: 111.8333 }, // Sibu, Sarawak
  { ...seed('Sri Aman'),          lat:  1.2333, lng: 111.4500 }, // Sri Aman, Sarawak
  { ...seed('Tanah Merah'),       lat:  5.8167, lng: 102.1500 }, // Tanah Merah, Kelantan
  { ...seed('Tangkak'),           lat:  2.2667, lng: 102.5500 }, // Tangkak, Johor
  { ...seed('Tanjung Malim'),     lat:  3.6833, lng: 101.5167 }, // Tanjung Malim, Perak
  { ...seed('Tawau'),             lat:  4.2500, lng: 117.8833 }, // Tawau, Sabah
  { ...seed('Temerloh'),          lat:  3.4500, lng: 102.4167 }, // Temerloh, Pahang
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
