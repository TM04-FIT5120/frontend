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

// AC 1.2.2: Activity and protection recommendations per API level
const AQI_MAP: Record<string, AQIMeta> = {
  good: {
    color:       '#059669',
    bgColor:     '#ecfdf5',
    borderColor: '#a7f3d0',
    chipClass:   'aqi-good',
    label:       'Good',
    advice:      'Outdoor activities such as walking are safe. No mask is required.',
    elderNote:   'Outdoor activities such as walking are safe. No mask is required. Normal outdoor duration is acceptable.',
  },
  moderate: {
    color:       '#eab308',
    bgColor:     '#fefce8',
    borderColor: '#fde047',
    chipClass:   'aqi-moderate',
    label:       'Moderate',
    advice:      'Outdoor activities are generally safe; sensitive individuals should be cautious.',
    elderNote:   'Outdoor activities are generally safe, but sensitive individuals should be cautious. Wearing a surgical mask is recommended. Limit outdoor activities to short or moderate durations.',
  },
  unhealthy: {
    color:       '#ea580c',
    bgColor:     '#fff7ed',
    borderColor: '#fed7aa',
    chipClass:   'aqi-unhealthy',
    label:       'Unhealthy',
    advice:      'Reduce prolonged outdoor exposure. Wear N95 or KN95 if going out.',
    elderNote:   'Elderly users should reduce prolonged outdoor exposure. Wearing a protective mask such as N95 or KN95 is recommended. Outdoor activities should be limited to short durations.',
  },
  'very-unhealthy': {
    color:       '#dc2626',
    bgColor:     '#fef2f2',
    borderColor: '#fecaca',
    chipClass:   'aqi-very-unhealthy',
    label:       'Very Unhealthy',
    advice:      'Avoid outdoor activities. If necessary, wear N95/KN95.',
    elderNote:   'Elderly users are advised to avoid outdoor activities. If going outside is necessary, wear a high-filtration mask (N95/KN95). Please limit outdoor activities.',
  },
  hazardous: {
    color:       '#7f1d1d',
    bgColor:     '#fef2f2',
    borderColor: '#fecaca',
    chipClass:   'aqi-hazardous',
    label:       'Hazardous',
    advice:      'Stay indoors. Only leave if absolutely necessary with a high-protection mask.',
    elderNote:   'Elderly users should stay indoors and avoid outdoor activities. Only leave home if absolutely necessary and wear a high-protection mask.',
  },
}

export function getAQIMeta(status: string): AQIMeta {
  return AQI_MAP[status] ?? AQI_MAP['moderate']
}

export function getStatusColor(status: string): string {
  return getAQIMeta(status).color
}

export function aqiPercent(aqi: number): number {
  return Math.min((aqi / 300) * 100, 100)
}