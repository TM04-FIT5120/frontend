import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Calendar, TrendingUp, AlertTriangle, Shield, MapPin } from 'lucide-react'
import { getAQIMeta } from '@/utils/aqiHelpers'
import { aqiToStatus } from '@/api/api'
import type { Location } from '@/data/locations'
import { useLocations } from '@/hooks/useLocations'
import { useLocationDetail } from '@/hooks/useLocationDetail'

// AC 2.1.1: risk categories for forecast — Low (Green), Moderate (Yellow), High Risk (Red)
function forecastRiskCategory(aqi: number): { label: string; color: string; bg: string } {
  const status = aqiToStatus(aqi)
  if (status === 'good') return { label: 'Low', color: '#059669', bg: '#ecfdf5' }
  if (status === 'moderate') return { label: 'Moderate', color: '#eab308', bg: '#fefce8' }
  return { label: 'High Risk', color: '#dc2626', bg: '#fef2f2' }
}

// AC 2.2.1: Haze season months for Malaysia (typical recurring pattern)
const HAZE_SEASON_MONTHS = [6, 7, 8, 9, 10] // June–October
const HAZE_SEASON_LABEL = 'Haze Season'

function isInHazeSeason(month: number): boolean {
  return HAZE_SEASON_MONTHS.includes(month)
}

// AC 2.2.2: within 2 weeks of high-risk period (e.g. start of haze season)
export function isApproachingHighRiskPeriod(): boolean {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  if (month === 5 && day >= 18) return true // within 2 weeks of June 1
  if (HAZE_SEASON_MONTHS.includes(month)) return true
  return false
}

// ── Short-term tab (AC 2.1.1, 2.1.2) ─────────────────────────────────────────
function ShortTermTab({ location }: { location: Location }) {
  const forecast = location.forecast7d ?? []
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // First day as "Next 24 hours" / next day
  const next24h = forecast[0]
  const hasUnhealthy = forecast.some(d => {
    const s = aqiToStatus(d.aqi)
    return s === 'unhealthy' || s === 'very-unhealthy' || s === 'hazardous'
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <p className="label-sm" style={{ marginBottom: 8 }}>Short-Term Forecast</p>
        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px', color: '#1a2332' }}>
          Next 24 hours / Next day
        </h3>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Predicted air quality for {location.name} (easy risk categories per AC 2.1.1).
        </p>
      </div>

      {forecast.length > 0 ? (
        <>
          <div className="card" style={{ padding: '1.5rem' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              Forecast by day — risk category & colour
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {forecast.map((d, i) => {
                const risk = forecastRiskCategory(d.aqi)
                const dateLabel = i === 0 ? 'Next 24h' : days[new Date(d.date).getDay()]
                return (
                  <div
                    key={d.date}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: risk.bg,
                      border: `1px solid ${risk.color}40`,
                      borderRadius: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: risk.color }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#1a2332' }}>{dateLabel}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: risk.color, fontWeight: 700 }}>{risk.label}</span>
                    </div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: risk.color }}>AQI {Math.round(d.aqi)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {hasUnhealthy && (
            <div className="card" style={{ padding: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <AlertTriangle size={22} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#991b1b', margin: '0 0 6px' }}>
                    Adjust Routine — Not recommended for going outdoors
                  </h4>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#4a5568', margin: 0, lineHeight: 1.6 }}>
                    Some days in the forecast show Unhealthy or High Risk levels. Consider switching to indoor activities, or plan outdoor time for days when air quality is predicted to be better (Low or Moderate).
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', margin: 0 }}>
            No short-term forecast data available for this location. The backend currently provides daily forecasts; 24-hour time-block detail would require a new endpoint.
          </p>
        </div>
      )}
    </div>
  )
}

// ── Long-term tab (AC 2.2.1) ─────────────────────────────────────────────────
function LongTermTab() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonth = new Date().getMonth()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <p className="label-sm" style={{ marginBottom: 8 }}>Long-Term Forecast</p>
        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px', color: '#1a2332' }}>
          Recurring pollution patterns
        </h3>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Recognisable seasonal patterns (e.g. {HAZE_SEASON_LABEL}) with colour-coded risk. Historical seasonal data would require a backend endpoint.
        </p>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
          Calendar-style view — high-risk periods
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {months.map((name, i) => {
            const monthNum = i + 1
            const isHighRisk = isInHazeSeason(monthNum)
            return (
              <div
                key={name}
                style={{
                  padding: '0.85rem',
                  borderRadius: 12,
                  background: isHighRisk ? '#fef2f2' : '#f8fafc',
                  border: `1px solid ${isHighRisk ? '#fecaca' : '#e2e8f0'}`,
                  textAlign: 'center',
                  opacity: monthNum === currentMonth + 1 ? 1 : 0.9,
                }}
              >
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#1a2332' }}>{name}</div>
                {isHighRisk && (
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#dc2626', fontWeight: 600, marginTop: 4 }}>
                    {HAZE_SEASON_LABEL}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#64748b', marginTop: 14, marginBottom: 0 }}>
          Typically higher API risk in Malaysia during June–October. Plan indoor alternatives during this period.
        </p>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function ForecastPage() {
  const [searchParams] = useSearchParams()
  const locationParam = searchParams.get('location') ?? ''
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'short' | 'long'>(tabParam === 'long' ? 'long' : 'short')

  const { locations } = useLocations()
  const resolvedLocationName = locationParam || locations[0]?.name || 'Kuala Lumpur'
  const { location } = useLocationDetail(decodeURIComponent(resolvedLocationName))

  return (
    <div className="mx-auto animate-fade-in" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <p className="label-sm" style={{ marginBottom: 8 }}>Forecast</p>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#1a2332', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Air Pollution Risk Prediction & Planning
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: '#4a5568', margin: 0, lineHeight: 1.6 }}>
          Short-term and long-term outlook so you can plan outdoor activities safely.
        </p>
      </div>

      {location && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '0.75rem 1rem', background: '#f1f5f9', borderRadius: 12 }}>
          <MapPin size={18} color="#64748b" />
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#1a2332' }}>Forecast for: {location.name}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #e2e8f0' }}>
        {[
          { id: 'short' as const, label: 'Short-Term Forecast', icon: TrendingUp },
          { id: 'long' as const, label: 'Long-Term Forecast', icon: Calendar },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            style={{
              padding: '0.6rem 1rem',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: activeTab === id ? '#1d4ed8' : '#64748b',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === id ? '2px solid #1d4ed8' : '2px solid transparent',
              marginBottom: -1,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {location ? (
        activeTab === 'short' ? <ShortTermTab location={location} /> : <LongTermTab />
      ) : (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <Shield size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', margin: 0 }}>
            Select a location from Home or Search to see its forecast here, or use the location selector.
          </p>
        </div>
      )}
    </div>
  )
}
