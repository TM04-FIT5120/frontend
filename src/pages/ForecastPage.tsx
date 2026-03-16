import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Calendar, TrendingUp, AlertTriangle, Shield, MapPin, Search, Wind, CheckCircle2, XCircle, Info } from 'lucide-react'
import { getAQIMeta } from '@/utils/aqiHelpers'
import { aqiToStatus } from '@/api/api'
import type { Location } from '@/data/locations'
import { useLocations } from '@/hooks/useLocations'
import { useLocationDetail } from '@/hooks/useLocationDetail'

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

function StatusIcon({ status }: { status: ReturnType<typeof aqiToStatus> }) {
  if (status === 'good')           return <CheckCircle2 size={22} />
  if (status === 'moderate')       return <Info size={22} />
  if (status === 'unhealthy')      return <Wind size={22} />
  if (status === 'very-unhealthy') return <AlertTriangle size={22} />
  return <XCircle size={22} />
}

// ── Short-term tab (AC 2.1.1, 2.1.2) ─────────────────────────────────────────
function ShortTermTab({ location }: { location: Location }) {
  const forecast = location.forecast7d ?? []
  const days     = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const next24h = forecast[0] ?? null

  // Only show days that are at least 2 days from today (skip today and tomorrow)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayAfterTomorrow = new Date(today)
  dayAfterTomorrow.setDate(today.getDate() + 2)

  const upcomingDays = forecast.filter(d => {
    const date = new Date(d.date)
    date.setHours(0, 0, 0, 0)
    return date >= dayAfterTomorrow
  })

  if (forecast.length === 0) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', margin: 0 }}>
          No forecast data available for {location.name}.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Section 1: Next 24 hours ─────────────────────────────────────────── */}
      {next24h && (() => {
        const status = aqiToStatus(next24h.aqi)
        const meta   = getAQIMeta(status)
        return (
          <div className="card" style={{ padding: '1.5rem', border: `1.5px solid ${meta.color}40`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: meta.color, borderRadius: '16px 16px 0 0' }} />
            <p className="label-sm" style={{ marginBottom: 10, marginTop: 4 }}>Next 24 Hours</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              {/* Big AQI number */}
              <div style={{ textAlign: 'center', minWidth: 90 }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '3.5rem', fontWeight: 900, color: meta.color, lineHeight: 1 }}>
                  {Math.round(next24h.aqi)}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 700, color: '#8a96a8', textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4 }}>AQI</div>
                <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, background: meta.bgColor, border: `1px solid ${meta.borderColor}`, borderRadius: 20, padding: '3px 10px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: meta.color }}>{meta.label}</span>
                </div>
              </div>

              {/* Advice + elderNote */}
              <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: meta.color, flexShrink: 0, marginTop: 1 }}><StatusIcon status={status} /></span>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: '#1a2332', margin: 0, lineHeight: 1.65, fontWeight: 500 }}>
                    {meta.advice}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: meta.bgColor, border: `1px solid ${meta.borderColor}`, borderRadius: 10, padding: '0.6rem 0.75rem' }}>
                  <Shield size={15} color={meta.color} style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: meta.color, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                    <strong>Note:</strong> {meta.elderNote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Section 2: Upcoming days (from today + 2) ────────────────────────── */}
      {upcomingDays.length > 0 ? (
        <div className="card" style={{ padding: '1.5rem' }}>
          <p className="label-sm" style={{ marginBottom: 14 }}>Upcoming Days</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcomingDays.map(d => {
              const status  = aqiToStatus(d.aqi)
              const meta    = getAQIMeta(status)
              const dateObj = new Date(d.date)
              const dayLabel = days[dateObj.getDay()]
              const dateStr  = `${dateObj.getDate()} ${months[dateObj.getMonth()]}`
              return (
                <div
                  key={d.date}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '0.9rem 1rem',
                    background: meta.bgColor,
                    border: `1px solid ${meta.borderColor}`,
                    borderRadius: 12,
                  }}
                >
                  {/* Day label */}
                  <div style={{ minWidth: 52, textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1rem', color: '#1a2332' }}>{dayLabel}</div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#8a96a8', marginTop: 2 }}>{dateStr}</div>
                  </div>

                  {/* Divider */}
                  <div style={{ width: 1, alignSelf: 'stretch', background: `${meta.color}30`, flexShrink: 0 }} />

                  {/* AQI + badge */}
                  <div style={{ minWidth: 70, textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: meta.color, lineHeight: 1 }}>
                      {Math.round(d.aqi)}
                    </div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', color: '#8a96a8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>AQI</div>
                    <div style={{ marginTop: 5, display: 'inline-block', background: `${meta.color}18`, borderRadius: 10, padding: '2px 7px' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 700, color: meta.color }}>{meta.label}</span>
                    </div>
                  </div>

                  {/* Advice + elderNote */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ color: meta.color, flexShrink: 0, marginTop: 1 }}><StatusIcon status={status} /></span>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#1a2332', margin: 0, lineHeight: 1.55, fontWeight: 500 }}>
                        {meta.advice}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, background: `${meta.color}10`, borderRadius: 8, padding: '0.4rem 0.6rem' }}>
                      <Shield size={13} color={meta.color} style={{ flexShrink: 0, marginTop: 2 }} />
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.76rem', color: meta.color, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                        <strong>Note:</strong> {meta.elderNote}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: '#8a96a8', margin: 0 }}>
            No upcoming day forecasts available beyond tomorrow.
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
  const navigate = useNavigate()

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
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: '#4a5568', margin: '0 0 16px', lineHeight: 1.6 }}>
          Short-term and long-term outlook so you can plan outdoor activities safely.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0.9rem 1.1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12 }}>
          <Search size={18} color="#1d4ed8" style={{ flexShrink: 0 }} />
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: '#1e40af', margin: 0, lineHeight: 1.55, flex: 1 }}>
            Use the Search page to find your desired location, then view its Short-Term or Long-Term forecast from the location detail page.
          </p>
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="btn btn-primary"
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}
          >
            <Search size={13} /> Search Location
          </button>
        </div>
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
