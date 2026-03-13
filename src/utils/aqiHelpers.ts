// ─── AQI Helpers ─────────────────────────────────────────────────────────────

export type AQIStatus = 'good' | 'moderate' | 'unhealthy' | 'very-unhealthy' | 'hazardous'

export interface AQIMeta {
  color:      string   // text / stroke colour
  bgColor:    string   // tinted background
  borderColor:string   // chip border
  chipClass:  string
  label:      string
  advice:     string
  elderNote:  string
}

const AQI_MAP: Record<string, AQIMeta> = {
  good: {
    color:       '#059669',
    bgColor:     '#ecfdf5',
    borderColor: '#a7f3d0',
    chipClass:   'aqi-good',
    label:       'Good',
    advice:      'Air quality is excellent.',
    elderNote:   'Safe for your morning walk or outdoor activities.',
  },
  moderate: {
    color:       '#d97706',
    bgColor:     '#fffbeb',
    borderColor: '#fde68a',
    chipClass:   'aqi-moderate',
    label:       'Moderate',
    advice:      'Air quality is acceptable.',
    elderNote:   'Limit extended outdoor exertion if you feel sensitive.',
  },
  unhealthy: {
    color:       '#ea580c',
    bgColor:     '#fff7ed',
    borderColor: '#fed7aa',
    chipClass:   'aqi-unhealthy',
    label:       'Unhealthy',
    advice:      'Unhealthy for sensitive groups.',
    elderNote:   'Avoid prolonged outdoor activities. Wear a mask if going out.',
  },
  'very-unhealthy': {
    color:       '#dc2626',
    bgColor:     '#fef2f2',
    borderColor: '#fecaca',
    chipClass:   'aqi-very-unhealthy',
    label:       'Very Unhealthy',
    advice:      'Everyone may experience health effects.',
    elderNote:   'Stay indoors. Keep windows closed. Use an air purifier if available.',
  },
  hazardous: {
    color:       '#7c3aed',
    bgColor:     '#f5f3ff',
    borderColor: '#ddd6fe',
    chipClass:   'aqi-hazardous',
    label:       'Hazardous',
    advice:      'Emergency conditions — serious risk to all.',
    elderNote:   'Do not go outside. Seek medical attention if breathing problems occur.',
  },
}

export function getAQIMeta(status: string): AQIMeta {
  return AQI_MAP[status] ?? AQI_MAP['moderate']
}

export function getStatusColor(status: string): string {
  return getAQIMeta(status).color
}

export function aqiPercent(aqi: number): number {
  return Math.min((aqi / 500) * 100, 100)
}