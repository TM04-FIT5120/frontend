import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, Search, Heart, Settings, BarChart2, Image, ChevronRight, ZoomIn, ZoomOut, X, TrendingUp } from 'lucide-react'

// ── Lightbox ────────────────────────────────────────────────────────────────────
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [scale, setScale] = useState(1)

  const zoomIn  = () => setScale(s => Math.min(s + 0.25, 3))
  const zoomOut = () => setScale(s => Math.max(s - 0.25, 0.5))

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === '+' || e.key === '=') zoomIn()
    if (e.key === '-') zoomOut()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.82)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Toolbar */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex', gap: 8, marginBottom: 12,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 50, padding: '6px 14px',
        }}
      >
        <button onClick={zoomOut} title="Zoom out" style={btnStyle}><ZoomOut size={18} color="#fff" /></button>
        <span style={{ color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', lineHeight: '32px', minWidth: 44, textAlign: 'center' }}>
          {Math.round(scale * 100)}%
        </span>
        <button onClick={zoomIn}  title="Zoom in"  style={btnStyle}><ZoomIn  size={18} color="#fff" /></button>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.25)', margin: '4px 4px' }} />
        <button onClick={onClose} title="Close"    style={btnStyle}><X       size={18} color="#fff" /></button>
      </div>

      {/* Image */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ overflow: 'auto', maxWidth: '90vw', maxHeight: '80vh', borderRadius: 12 }}
      >
        <img
          src={src}
          alt={alt}
          style={{
            display: 'block',
            maxWidth: '90vw',
            maxHeight: '80vh',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            transition: 'transform 0.2s ease',
            borderRadius: 10,
          }}
        />
      </div>

      <p style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', marginTop: 12 }}>
        Click outside or press Esc to close
      </p>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: '50%',
}

const TOC_ITEMS = [
  { id: 'location',   label: 'Using Your Location'          },
  { id: 'search',     label: 'Search & City Details'        },
  { id: 'forecast',   label: 'Short-term & Long-term Forecast' },
  { id: 'compare',    label: 'Comparing Cities'             },
  { id: 'favourites', label: 'Adding & Viewing Favourites'  },
  { id: 'settings',   label: 'Settings & Preferences'       },
]

// ── Image placeholder / real image ─────────────────────────────────────────────
function ImgBox({ caption, src }: { caption: string; src?: string }) {
  const [open, setOpen] = useState(false)

  if (src) {
    return (
      <>
        {open && createPortal(<Lightbox src={src} alt={caption} onClose={() => setOpen(false)} />, document.body)}
        <div
          onClick={() => setOpen(true)}
          title="Click to zoom"
          style={{
            width: '100%', borderRadius: 12, overflow: 'hidden',
            border: '1px solid #e8edf4', cursor: 'zoom-in', position: 'relative',
          }}
        >
          <img src={src} alt={caption} style={{ width: '100%', height: 'auto', display: 'block' }} />
          <div style={{
            position: 'absolute', bottom: 8, right: 8,
            background: 'rgba(0,0,0,0.45)', borderRadius: 6, padding: '3px 7px',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <ZoomIn size={13} color="#fff" />
            <span style={{ color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem' }}>Click to zoom</span>
          </div>
        </div>
      </>
    )
  }
  return (
    <div
      style={{
        flex: '0 0 auto',
        width: '100%',
        minHeight: 180,
        border: '2px dashed #bfdbfe',
        borderRadius: 12,
        background: '#f0f7ff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '1.25rem',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: '#dbeafe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image size={20} color="#3b82f6" />
      </div>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#3b82f6',
          margin: 0,
          textAlign: 'center',
          lineHeight: 1.45,
        }}
      >
        {caption}
      </p>
    </div>
  )
}

// ── Step row: text left, image right ──────────────────────────────────────────
function StepRow({
  number,
  title,
  description,
  imageCaption,
  imageSrc,
}: {
  number: number
  title: string
  description: string
  imageCaption: string
  imageSrc?: string
}) {
  const textSide = (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: '#1d4ed8',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.9rem',
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {number}
      </div>
      <div>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.98rem',
            fontWeight: 700,
            color: '#1a2332',
            margin: '0 0 5px',
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.88rem',
            color: '#4a5568',
            margin: 0,
            lineHeight: 1.65,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  )

  const imgSide = <ImgBox caption={imageCaption} src={imageSrc} />

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        alignItems: 'center',
        padding: '1.25rem 0',
        borderBottom: '1px solid #f1f5f9',
      }}
    >
      {textSide}{imgSide}
    </div>
  )
}

// ── Tip banner ─────────────────────────────────────────────────────────────────
function Tip({ text }: { text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: 12,
        padding: '0.85rem 1.1rem',
        marginTop: 4,
      }}
    >
      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.85rem',
          color: '#92400e',
          margin: 0,
          lineHeight: 1.6,
          fontWeight: 500,
        }}
      >
        {text}
      </p>
    </div>
  )
}

// ── Section card ───────────────────────────────────────────────────────────────
function Section({
  id,
  icon: Icon,
  iconColor,
  iconBg,
  sectionLabel,
  title,
  children,
}: {
  id: string
  icon: React.ElementType
  iconColor: string
  iconBg: string
  sectionLabel: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div id={id} className="card" style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
      {/* Section header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '1.25rem 0',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 13,
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={21} color={iconColor} />
        </div>
        <div>
          <p className="label-sm" style={{ marginBottom: 3 }}>{sectionLabel}</p>
          <h2
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#1a2332',
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>
      </div>

      {/* Steps */}
      <div>{children}</div>

      {/* Remove bottom border on last child */}
      <div style={{ paddingBottom: '0.25rem' }} />
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export function GuidePage() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="mx-auto animate-fade-in" style={{ maxWidth: 860 }}>

      {/* Page header — same pattern as Compare / Search / Settings */}
      <div style={{ marginBottom: '2rem' }}>
        <p className="label-sm" style={{ marginBottom: 8 }}>Help &amp; Support</p>
        <h1
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '2rem',
            fontWeight: 800,
            color: '#1a2332',
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          How to Use MyAirSafe
        </h1>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.95rem',
            color: '#4a5568',
            margin: 0,
            lineHeight: 1.65,
          }}
        >
          A step-by-step visual guide to all the features of MyAirSafe.
        </p>
      </div>

      {/* ── Table of contents ───────────────────────── */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e8edf4',
          borderRadius: 20,
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 16px rgba(30,41,59,0.05)',
        }}
      >
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#8a96a8',
            margin: '0 0 14px',
          }}
        >
          What's covered in this guide
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TOC_ITEMS.map((item, i) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.6rem 0.75rem',
                borderRadius: 10,
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {i + 1}
              </span>
              <span style={{ color: '#1d4ed8', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 600 }}>
                {item.label}
              </span>
              <ChevronRight size={15} color="#93c5fd" style={{ marginLeft: 'auto' }} />
            </button>
          ))}
        </div>
      </div>

      {/* ── 1. Location Fetching ─────────────────────────────────────────────── */}
      <Section
        id="location"
        icon={MapPin}
        iconColor="#1d4ed8"
        iconBg="#eff6ff"
        sectionLabel="Feature 1"
        title="Using Your Location"
      >
        <StepRow
          number={1}
          title="Open the Home page"
          description="When you open MyAirSafe you land on the Home page. When you scroll down a little you will see a map of Malaysia and a list of city air quality readings."
          imageCaption="Home page, overview of the map and city list"
          imageSrc="/1.1.png"
        />
        <StepRow
          number={2}
          title='Tap "Use My Location"'
          description='Look for the blue "Get My Location" button in the Air Quality Map section and click it. A pop up will ask your permission to access your location, click "Allow". And your browser might also ask permission, click "Allow while visting the site" to allow location access for this site or click "Allow this time" to only allow once.'
          imageCaption='"Use My Location" button highlighted on the Home page'
          imageSrc="/1.2.png"
        />
        <StepRow
          number={3}
          title="View your nearest station"
          description="The app finds the monitoring station closest to you and highlights it on the map. Your current AQI number appears at the top."
          imageCaption="Map zoomed in showing the nearest station highlighted"
          imageSrc="/1.3.png"
        />
        <StepRow
          number={4}
          title="Read the health advice and use Forecast"
          description='Below your AQI you will see a short message such as "Air is Good, Safe to go outside", written for seniors. Use the "Short-term Forecast" and "Long-term Forecast" buttons to plan outdoor activities. "View Full Details" takes you to the city detail page with more information.'
          imageCaption="Health advice and Forecast buttons on the right panel"
          imageSrc="/1.4.png"
        />
        <Tip text="If the app cannot detect your location, make sure Location Services are turned on in your device's settings." />
      </Section>

      {/* ── 2. Search & City Details ─────────────────────────────────────────── */}
      <Section
        id="search"
        icon={Search}
        iconColor="#ca8a04"
        iconBg="#fefce8"
        sectionLabel="Feature 2"
        title="Search &amp; City Details"
      >
        <StepRow
          number={1}
          title="Open the Search page"
          description='Click "Search" in the top navigation bar. You will see a large search bar and a full list of monitoring stations below it. Scroll down to see more stations.'
          imageCaption="Search page showing the search bar and full station list"
          imageSrc="/2.1.png"
        />
        <StepRow
          number={2}
          title="Type a city, place, location or building name"
          description='Click the search bar and type a few letters, for example "Penang", "Sunway Pyramid". You will see a list of matching results auto suggested below. Choose one from the auto suggested list or from the filtered station list.'
          imageCaption="Search bar with typed text and filtered results shown below"
          imageSrc="/2.2.png"
        />
        <StepRow
          number={3}
          title="Tap a city to see full details"
          description="Click any suggested place to open its AQI monitoring station's detailed report page which includes individual pollutant levels, a trend chart, and full health advice. From there you can use the Short-term Forecast and Long-term Forecast buttons to see the forecast for that location."
          imageCaption="City detail page with Forecast buttons"
          imageSrc="/2.3.png"
        />
        <StepRow
          number={4}
          title="Go back to search results"
          description="Press the back arrow (←) at the top left of the detail page, or use your browser's Back button, to return to the search list."
          imageCaption="Back arrow button highlighted at the top of the detail page"
          imageSrc="/2.4.png"
        />
        <Tip text="You can also reach any city's detail page by tapping its card on the Home page or the Favourites page." />
      </Section>

      {/* ── 3. Forecast (Short-term & Long-term) ─────────────────────────────────── */}
      <Section
        id="forecast"
        icon={TrendingUp}
        iconColor="#059669"
        iconBg="#ecfdf5"
        sectionLabel="Feature 3"
        title="Short-term & Long-term Forecast"
      >
        <StepRow
          number={1}
          title="Open the Forecast page"
          description='Click "Forecast" in the top navigation bar. The page opens with a blue info banner at the top reminding you to pick a location first, and two tabs below it: "Short-Term Forecast" and "Long-Term Forecast".'
          imageCaption="Forecast page header with the two tabs and location info banner"
          imageSrc="/3.1.png"
        />
        <StepRow
          number={2}
          title="Select a location to forecast"
          description='The forecast is always tied to a specific station. The quickest way is to go to the Search page, find your city, open its detail page, and tap either the "Short-term Forecast" or "Long-term Forecast" button. This brings you straight to the Forecast page with that city pre-selected. You can also reach it from the Home page panel after using "Get My Location".'
          imageCaption="Short-term / Long-term Forecast buttons on the city detail page"
          imageSrc="/3.2.png"
        />
        <StepRow
          number={3}
          title="Read the Next 24 Hours card (Short-Term tab)"
          description='On the Short-Term tab, the first card shows the predicted AQI for the next 24 hours. You will see a large colour-coded AQI number with a status badge (e.g. Good, Moderate, Unhealthy), a short health advice message, and a blue Shield note with specific guidance for seniors and sensitive groups.'
          imageCaption="Next 24 Hours card showing AQI, status badge, advice, and senior shield note"
          imageSrc="/3.3.png"
        />
        <StepRow
          number={4}
          title="Check the Upcoming Days (Short-Term tab)"
          description="Below the 24-hour card, the Upcoming Days section lists each day from the day after tomorrow onwards. Each row shows the day name and date, the predicted AQI number with its status label, the health advice for that day, and the senior-focused shield note. Days with higher AQI are highlighted in red or orange tones, these are the days to consider staying indoors."
          imageCaption="Upcoming days list with day, AQI, status badge, and health advice per row"
          imageSrc="/3.4.png"
        />
        <StepRow
          number={5}
          title="View the 12-Month Prediction (Long-Term tab)"
          description='Switch to the "Long-Term Forecast" tab. If prediction data is available for your city (based on 2 years of historical AQI data), you will see a grid of the next 12 months, each tile shows the month name, the predicted average AQI, a colour-coded status badge, and health advice. Months falling in the Haze Season (June–October) are flagged in red with an extra warning.'
          imageCaption="12-month prediction grid with colour-coded monthly AQI tiles"
          imageSrc="/3.5.png"
        />
        <StepRow
          number={6}
          title="Use the High-Risk Period calendar (Long-Term tab)"
          description="If no prediction data is available for your selected city, the Long-Term tab still shows a 12-month calendar grid highlighting the known high-risk haze season months (June–October) in red. Use this to plan indoor alternatives ahead of time, such as indoor walks, exercise at home, or visiting air-conditioned venues during those months."
          imageCaption="High-risk period calendar showing haze season months highlighted in red"
          imageSrc="/3.6.png"
        />
        <Tip text="Check the Short-Term Forecast the night before any outdoor activity. If the next 24 hours show Unhealthy or worse, plan an indoor alternative. Use the Long-Term tab at the start of each month to prepare for the months ahead." />
      </Section>

      {/* ── 4. Compare Cities ────────────────────────────────────────────────────── */}
      <Section
        id="compare"
        icon={BarChart2}
        iconColor="#059669"
        iconBg="#ecfdf5"
        sectionLabel="Feature 4"
        title="Comparing Cities"
      >
        <StepRow
          number={1}
          title="Open the Compare page"
          description='Click "Compare" in the navigation bar at the top. You will see two panels, one for each city you want to compare.'
          imageCaption="Compare page with two empty city panels side by side"
          imageSrc="/4.1.png"
        />
        <StepRow
          number={2}
          title="Choose the first city"
          description='Click inside the left dropdown and choose a city from the list.'
          imageCaption="Left dropdown open with city options filtered"
          imageSrc="/4.2.png"
        />
        <StepRow
          number={3}
          title="Choose the second city"
          description="Do the same for the right panel. Pick a different city you want to compare against the first one."
          imageCaption="Both dropdowns filled with two different cities selected"
          imageSrc="/4.3.png"
        />
        <StepRow
          number={4}
          title="Read the results"
          description="Each panel shows the AQI number, colour-coded status badge, PM2.5 and PM10 levels, and a health summary. The cleaner city is labelled at the top."
          imageCaption="Comparison results showing AQI rings, pollutant readings, and the Cleaner Air badge"
          imageSrc="/4.4.png"
        />
        <StepRow
          number={5}
          title="Check the comparison summary"
          description="Scroll down to see the Summary card which shows the AQI difference, which city has cleaner air, and a Senior Recommendation tailored for elderly users."
          imageCaption="Comparison Summary card with AQI difference and senior recommendation"
          imageSrc="/4.5.png"
        />
        <Tip text="Use Compare before planning a morning walk; pick your city and a nearby town to see where the air is cleaner that day." />
      </Section>

      {/* ── 5. Favourites ────────────────────────────────────────────────────── */}
      <Section
        id="favourites"
        icon={Heart}
        iconColor="#dc2626"
        iconBg="#fef2f2"
        sectionLabel="Feature 5"
        title="Adding &amp; Viewing Favourites"
      >
        <StepRow
          number={1}
          title="Find a city you want to save"
          description="Use Search or the Home page to find a city you check regularly. Click on the city card to open its detail page."
          imageCaption="City detail page ready to be saved as a favourite"
          imageSrc="/5.1.png"
        />
        <StepRow
          number={2}
          title="Tap the heart icon"
          description="On the detail page click the heart icon (♥) near the city name. It turns red to confirm the city is saved to your Favourites."
          imageCaption="Heart icon highlighted, showing the red saved state"
          imageSrc="/5.2.png"
        />
        <StepRow
          number={3}
          title="Open the Favourites page"
          description='Click "Favorites" in the top navigation bar. All your saved cities are listed here with their live AQI readings.'
          imageCaption="Favourites page showing a list of saved city cards"
          imageSrc="/5.3.png"
        />
        <StepRow
          number={4}
          title="Tap a favourite to check details"
          description="From the Favourites page, tap any city card to go directly to its full detail page, the quickest way to check places that matter to you."
          imageCaption="Tapping a favourite card to navigate to the detail page"
          imageSrc="/5.4.png"
        />
        <StepRow
          number={5}
          title="Remove a favourite"
          description="To remove a saved city, open the Favourites page and click the red bin icon on the right side of the city card. It is removed immediately."
          imageCaption="Red bin/trash icon highlighted on a favourite card"
          imageSrc="/5.5.png"
        />
        <Tip text="Your favourites are saved so that you can easily access them next time you open MyAirSafe." />
      </Section>

      {/* ── 6. Settings ──────────────────────────────────────────────────────── */}
      <Section
        id="settings"
        icon={Settings}
        iconColor="#7c3aed"
        iconBg="#f5f3ff"
        sectionLabel="Feature 6"
        title="Settings &amp; Preferences"
      >
        <StepRow
          number={1}
          title="Open the Settings page"
          description='Click "Settings" in the top navigation bar. You will see all customisation options arranged in sections.'
          imageCaption="Settings page overview showing all available options"
          imageSrc="/6.1.png"
        />
        <StepRow
          number={2}
          title="Turn on air quality alerts"
          description="Under General, toggle Air Quality Alerts to ON (blue). Your browser will ask permission, click Allow. You will be notified when air quality is poor."
          imageCaption="Notifications toggle in the ON (blue) position"
          imageSrc="/6.2.png"
        />
        <StepRow
          number={3}
          title="Save or reset your settings"
          description='Click "Save Changes" (blue button at the bottom) to save your preferences. Click "Reset Defaults" to undo all changes and return to the original settings.'
          imageCaption="Save Changes and Reset Defaults buttons at the bottom of Settings"
          imageSrc="/6.3.png"
        />
        <Tip text="Settings are stored on your device only. If you use a different device you will need to set your preferences again on that device." />
      </Section>

      {/* Footer note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: 16,
          padding: '1.1rem 1.4rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#15803d',
              margin: '0 0 3px',
            }}
          >
            You are all set!
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              color: '#166534',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            You now know how to use all the main features of MyAirSafe. Come back to this Guide page anytime by clicking <strong>Guide</strong> in the top navigation bar.
          </p>
        </div>
      </div>

    </div>
  )
}