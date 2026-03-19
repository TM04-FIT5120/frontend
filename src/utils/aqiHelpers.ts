// ─── AQI Helpers ─────────────────────────────────────────────────────────────

export type AQIStatus = 'good' | 'moderate' | 'unhealthy' | 'very-unhealthy' | 'hazardous'

export interface AQIMeta {
  color:       string   // text / stroke colour
  bgColor:     string   // tinted background
  borderColor: string   // chip border
  chipClass:   string
  label:       string
  advice:      string
  elderNotes:  string[]
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
    elderNotes: [
      'Outdoor activities such as walking are safe. No mask is required. Normal outdoor duration is acceptable.',
      'Air quality is clean. Elderly can enjoy outdoor walks without concern. No protective equipment needed.',
      'Conditions are ideal for outdoor activities. Seniors may go outside freely with no restrictions.',
      'Air is fresh and safe. No mask needed; feel free to take your usual walks outside.',
      'Great air quality today. Elderly individuals can spend time outdoors without any health concerns.',
    ],
  },
  moderate: {
    color:       '#eab308',
    bgColor:     '#fefce8',
    borderColor: '#fde047',
    chipClass:   'aqi-moderate',
    label:       'Moderate',
    advice:      'Outdoor activities are generally safe; sensitive individuals should be cautious.',
    elderNotes: [
      'Outdoor activities are generally safe, but sensitive individuals should be cautious. Wearing a surgical mask is recommended. Limit outdoor activities to short or moderate durations.',
      'Air quality is acceptable but slightly polluted. Elderly individuals should wear a surgical mask outdoors and avoid prolonged exposure.',
      'Seniors should take care during outdoor activities. A surgical mask is advised, and outdoor time should be kept to moderate durations.',
      'Mildly elevated pollution. Sensitive groups including elderly are encouraged to wear a mask and shorten outdoor sessions.',
      'Generally safe air, but elderly people should consider wearing a surgical mask and limiting time spent outdoors.',
    ],
  },
  unhealthy: {
    color:       '#ea580c',
    bgColor:     '#fff7ed',
    borderColor: '#fed7aa',
    chipClass:   'aqi-unhealthy',
    label:       'Unhealthy',
    advice:      'Reduce prolonged outdoor exposure. Wear N95 or KN95 if going out.',
    elderNotes: [
      'Elderly users should reduce prolonged outdoor exposure. Wearing a protective mask such as N95 or KN95 is recommended. Outdoor activities should be limited to short durations.',
      'Air quality is unhealthy. Seniors should minimise outdoor time and wear an N95 or KN95 mask if going outside.',
      'Elderly and sensitive individuals are advised to keep outdoor activities brief and use an N95 or KN95 mask for protection.',
      'Reduced air quality may affect respiratory health. Elderly users should limit outdoor exposure and wear a high-filtration mask.',
      'Seniors should avoid prolonged time outdoors. If going out is necessary, an N95 or KN95 mask provides the best protection.',
    ],
  },
  'very-unhealthy': {
    color:       '#dc2626',
    bgColor:     '#fef2f2',
    borderColor: '#fecaca',
    chipClass:   'aqi-very-unhealthy',
    label:       'Very Unhealthy',
    advice:      'Avoid outdoor activities. If necessary, wear N95/KN95.',
    elderNotes: [
      'Elderly users are advised to avoid outdoor activities. If going outside is necessary, wear a high-filtration mask (N95/KN95). Please limit outdoor activities.',
      'Air quality is very poor. Elderly individuals should stay indoors where possible and wear an N95/KN95 mask if they must go out.',
      'Seniors should remain indoors. Going outside should be avoided; if unavoidable, wear a well-fitting N95 or KN95 mask at all times.',
      'Very unhealthy air conditions. Elderly users are strongly advised to stay inside and avoid unnecessary outdoor exposure.',
      'Outdoor air is hazardous for sensitive groups. Elderly individuals should avoid going outside and use an N95/KN95 if absolutely necessary.',
    ],
  },
  hazardous: {
    color:       '#7f1d1d',
    bgColor:     '#fef2f2',
    borderColor: '#fecaca',
    chipClass:   'aqi-hazardous',
    label:       'Hazardous',
    advice:      'Stay indoors. Only leave if absolutely necessary with a high-protection mask.',
    elderNotes: [
      'Elderly users should stay indoors and avoid outdoor activities. Only leave home if absolutely necessary and wear a high-protection mask.',
      'Hazardous air quality. Seniors must stay indoors. If going outside is unavoidable, wear a properly fitted N95 or KN95 mask.',
      'Extremely poor air quality. Elderly individuals should not go outside. If essential, use a high-protection mask and minimise time outdoors.',
      'Air is dangerous for health. Seniors are strongly urged to remain indoors and seal windows if possible. Only go out with maximum protection.',
      'Critical air quality alert. Elderly users should stay inside at all times. If leaving is essential, a high-filtration mask is mandatory.',
    ],
  },
}

export function getAQIMeta(status: string): AQIMeta {
  return AQI_MAP[status] ?? AQI_MAP['moderate']
}

export function getRandomElderNote(status: string): string {
  const notes = getAQIMeta(status).elderNotes
  return notes[Math.floor(Math.random() * notes.length)]
}

export function getStatusColor(status: string): string {
  return getAQIMeta(status).color
}

export function aqiPercent(aqi: number): number {
  return Math.min((aqi / 300) * 100, 100)
}