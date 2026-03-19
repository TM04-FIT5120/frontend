import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Calendar, TrendingUp, AlertTriangle, Shield, MapPin, Search, Wind, CheckCircle2, XCircle, Info, Loader2 } from 'lucide-react'
import { getAQIMeta, getRandomElderNote } from '@/utils/aqiHelpers'
import { aqiToStatus, fetchPredictedAqiNext12Months, reverseGeocodeCity, type CityAqiForecast } from '@/api/api'
import type { Location, PredictedMonthlyAqi } from '@/data/locations'
import { useLocations } from '@/hooks/useLocations'
import { useLocationDetail } from '@/hooks/useLocationDetail'

// AC 2.2.1: Haze season months for Malaysia (typical recurring pattern)
const HAZE_SEASON_MONTHS = [6, 7, 8, 9, 10] // June–October
const HAZE_SEASON_LABEL = 'Haze Season'

function isInHazeSeason(month: number): boolean {
  return HAZE_SEASON_MONTHS.includes(month)
}

// AC 2.2.2: within 1 month of high-risk period (e.g. start of haze season)
export function isApproachingHighRiskPeriod(): boolean {
  const now = new Date()
  const month = now.getMonth() + 1
  // Treat May (month 5) as the 1-month "approaching" window before June,
  // then the entire haze season (June–October) as high-risk.
  if (month === 5) return true
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
                    <strong>Note:</strong> {getRandomElderNote(status)}
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
                        <strong>Note:</strong> {getRandomElderNote(status)}
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
function LongTermTab({
  location,
  forecast,
  loading,
}: {
  location: Location
  forecast: PredictedMonthlyAqi[] | undefined
  loading: boolean
}) {
  const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  if (loading) {
    return (
      <div className="card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Loader2 size={40} color="#64748b" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', margin: 0 }}>
          Loading 12‑month AQI predictions for {location.name}...
        </p>
      </div>
    )
  }

  if (!forecast || forecast.length === 0) {
    const currentMonth = new Date().getMonth()
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <p className="label-sm" style={{ marginBottom: 8 }}>Long-Term Forecast</p>
          <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px', color: '#1a2332' }}>
            Recurring pollution patterns
          </h3>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Recurring {HAZE_SEASON_LABEL}. Not enough historical data to make long term predictions.
          </p>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            High-risk periods
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {monthsShort.map((name, i) => {
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
            Typically higher pollution risk in Malaysia during June–October. Plan indoor alternatives during this period.
          </p>
        </div>
      </div>
    )
  }

  const enriched = forecast.map(item => {
    const [yearStr, monthStr] = item.month.split('-')
    const year = Number(yearStr)
    const monthIndex = Number(monthStr) - 1
    const status = aqiToStatus(item.aqi)
    const meta = getAQIMeta(status)
    const isHighSeason = isInHazeSeason(monthIndex + 1)
    const label = `${monthsShort[monthIndex]} ${year}`
    return { ...item, year, monthIndex, status, meta, isHighSeason, label }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <p className="label-sm" style={{ marginBottom: 8 }}>12-Month AQI Prediction</p>
        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px', color: '#1a2332' }}>
          Predicted air quality for {location.name}
        </h3>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Based on the last 2 years of AQI data, the next 12 months average AQI is predicted.
        </p>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
          Next 12 months — predicted monthly average AQI
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          {enriched.map(item => (
            <div
              key={item.month}
              style={{
                padding: '0.9rem 0.95rem',
                borderRadius: 12,
                border: `1px solid ${item.meta.borderColor}`,
                background: item.meta.bgColor,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.85rem', color: '#1a2332' }}>
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: item.meta.color,
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: `${item.meta.color}10`,
                  }}
                >
                  {item.meta.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ minWidth: 46, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: item.meta.color, lineHeight: 1 }}>
                    {Math.round(item.aqi)}
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#64748b' }}>AVG. AQI</div>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#1e293b', margin: 0, lineHeight: 1.5 }}>
                    {item.meta.advice}
                  </p>
                  {item.isHighSeason && (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#dc2626', margin: '4px 0 0' }}>
                      {HAZE_SEASON_LABEL} period — plan indoor alternatives where possible.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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

  const [cityForecasts, setCityForecasts] = useState<CityAqiForecast[] | null>(null)
  const [forecastLoading, setForecastLoading] = useState(false)
  const [canonicalCityName, setCanonicalCityName] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setForecastLoading(true)
      try {
        const data = await fetchPredictedAqiNext12Months()
        if (!cancelled) {
          setCityForecasts(data)
        }
      } catch {
        if (!cancelled) {
          setCityForecasts([])
        }
      } finally {
        if (!cancelled) {
          setForecastLoading(false)
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  // Resolve a canonical city name from coordinates using reverse geocoding,
  // so we can match against DB-backed prediction city_names.
  useEffect(() => {
    let cancelled = false
    async function resolveCanonical() {
      if (!location) {
        setCanonicalCityName(null)
        return
      }
      try {
        const name = await reverseGeocodeCity(location.lat, location.lng)
        if (!cancelled) {
          setCanonicalCityName(name || location.name)
        }
      } catch {
        if (!cancelled) {
          setCanonicalCityName(location.name)
        }
      }
    }
    resolveCanonical()
    return () => {
      cancelled = true
    }
  }, [location])

  const isHighAqiTest = import.meta.env.DEV && searchParams.get('testHighAqi') === '1'
  const currentCityKey = location ? (canonicalCityName ?? location.name) : ''
  const isViewingAlorSetarForTest = isHighAqiTest && currentCityKey === 'Alor Setar'

  // Dummy dataset for Alor Setar — only used when dev High-Risk Alert Test is active and user is viewing Alor Setar
  const ALOR_SETAR_DUMMY: CityAqiForecast = {
    cityName: 'Alor Setar',
    predictions: [
      { month: '2026-04', predictedAqi: 145.0442856239046 },
      { month: '2026-05', predictedAqi: 155.3533942061333 },
      { month: '2026-06', predictedAqi: 99.6625027883619 },
      { month: '2026-07', predictedAqi: 97.9716113705906 },
      { month: '2026-08', predictedAqi: 90.2807199528192 },
      { month: '2026-09', predictedAqi: 65.5898285350478 },
      { month: '2026-10', predictedAqi: 56.8989371172765 },
      { month: '2026-11', predictedAqi: 47.2080456995051 },
      { month: '2026-12', predictedAqi: 47.5171542817338 },
      { month: '2027-01', predictedAqi: 47.8262628639624 },
      { month: '2027-02', predictedAqi: 48.135371446191 },
      { month: '2027-03', predictedAqi: 48.4444800284197 },
    ],
  }

  // Use API data for all locations. Only when dev test is on and user is viewing Alor Setar, show dummy data for that city.
  const effectiveCityForecasts: CityAqiForecast[] | null =
    isViewingAlorSetarForTest
      ? [...(cityForecasts ?? []).filter(c => c.cityName !== 'Alor Setar'), ALOR_SETAR_DUMMY]
      : cityForecasts

  const longTermForecast: PredictedMonthlyAqi[] | undefined =
    location && effectiveCityForecasts
      ? (effectiveCityForecasts.find(c => c.cityName === (canonicalCityName || location.name))?.predictions ?? undefined)?.map(p => ({
          month: p.month,
          aqi: p.predictedAqi,
        }))
      : undefined

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
        activeTab === 'short'
          ? <ShortTermTab location={location} />
          : <LongTermTab location={location} forecast={longTermForecast} loading={forecastLoading} />
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
