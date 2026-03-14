import { MapPin, BarChart2, Search, Heart, Settings, Image, ChevronRight } from 'lucide-react'

const TOC_ITEMS = [
  { id: 'location',   label: 'Using Your Location'          },
  { id: 'compare',    label: 'Comparing Cities'             },
  { id: 'search',     label: 'Search & City Details'        },
  { id: 'favourites', label: 'Adding & Viewing Favourites'  },
  { id: 'settings',   label: 'Settings & Preferences'       },
]

// ── Image placeholder ──────────────────────────────────────────────────────────
function ImgBox({ caption }: { caption: string }) {
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
}: {
  number: number
  title: string
  description: string
  imageCaption: string
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

  const imgSide = <ImgBox caption={imageCaption} />

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
          A step-by-step visual guide to all the features of MyAirSafe — designed to be easy to follow.
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
          description="When you open MyAirSafe you land on the Home page. You will see a map of Malaysia and a list of city air quality readings."
          imageCaption="Home page — overview of the map and city list"
        />
        <StepRow
          number={2}
          title='Tap "Use My Location"'
          description='Look for the blue "Use My Location" button near the top of the page and click it. Your browser will ask permission — click Allow.'
          imageCaption='"Use My Location" button highlighted on the Home page'
        />
        <StepRow
          number={3}
          title="View your nearest station"
          description="The app finds the monitoring station closest to you and highlights it on the map. Your current AQI number appears at the top."
          imageCaption="Map zoomed in showing the nearest station highlighted"
        />
        <StepRow
          number={4}
          title="Read the health advice"
          description='Below your AQI you will see a short message such as "Air is Good — Safe to go outside". This is written specifically for seniors.'
          imageCaption="Health advice message displayed below the AQI reading"
        />
        <Tip text="If the app cannot detect your location, make sure Location Services are turned on in your device's settings." />
      </Section>

      {/* ── 2. Compare Cities ────────────────────────────────────────────────── */}
      <Section
        id="compare"
        icon={BarChart2}
        iconColor="#059669"
        iconBg="#ecfdf5"
        sectionLabel="Feature 2"
        title="Comparing Cities"
      >
        <StepRow
          number={1}
          title="Open the Compare page"
          description='Click "Compare" in the navigation bar at the top. You will see two panels — one for each city you want to compare.'
          imageCaption="Compare page — two empty city panels side by side"
        />
        <StepRow
          number={2}
          title="Choose the first city"
          description='Click inside the left dropdown and type a few letters — for example "Kuala" — then select a city from the filtered list.'
          imageCaption="Left dropdown open with city options filtered"
        />
        <StepRow
          number={3}
          title="Choose the second city"
          description="Do the same for the right panel. Pick a different city you want to compare against the first one."
          imageCaption="Both dropdowns filled with two different cities selected"
        />
        <StepRow
          number={4}
          title="Read the results"
          description="Each panel shows the AQI number, colour-coded status badge, PM2.5 and PM10 levels, and a health summary. The cleaner city is labelled at the top."
          imageCaption="Comparison results showing AQI rings, pollutant readings, and the Cleaner Air badge"
        />
        <StepRow
          number={5}
          title="Check the comparison summary"
          description="Scroll down to see the Summary card which shows the AQI difference, which city has cleaner air, and a Senior Recommendation tailored for elderly users."
          imageCaption="Comparison Summary card with AQI difference and senior recommendation"
        />
        <Tip text="Use Compare before planning a morning walk — pick your city and a nearby town to see where the air is cleaner that day." />
      </Section>

      {/* ── 3. Search & City Details ─────────────────────────────────────────── */}
      <Section
        id="search"
        icon={Search}
        iconColor="#ca8a04"
        iconBg="#fefce8"
        sectionLabel="Feature 3"
        title="Search &amp; City Details"
      >
        <StepRow
          number={1}
          title="Open the Search page"
          description='Click "Search" in the top navigation bar. You will see a large search bar and a full list of monitoring stations below it.'
          imageCaption="Search page showing the search bar and full station list"
        />
        <StepRow
          number={2}
          title="Type a city or station name"
          description='Click the search bar and type a few letters — for example "Penang". The list below filters in real time. You do not need to press Enter.'
          imageCaption="Search bar with typed text and filtered results shown below"
        />
        <StepRow
          number={3}
          title="Browse the results"
          description="Each card shows the city name, current AQI number, and a colour-coded status badge. Scroll down to see more stations."
          imageCaption="Filtered results list with AQI badges and colour accents"
        />
        <StepRow
          number={4}
          title="Tap a city to see full details"
          description="Click any city card to open its detailed report page which includes individual pollutant levels, a trend chart, and full health advice."
          imageCaption="City detail page opened from a search result card"
        />
        <StepRow
          number={5}
          title="Read the detail page"
          description="The detail page shows: the AQI number and colour, PM2.5/PM10/O3/NO2/CO levels, a 24-hour trend chart, and plain-language health advice for seniors."
          imageCaption="Detail page showing pollutant breakdown, trend chart, and health advice"
        />
        <StepRow
          number={6}
          title="Go back to search results"
          description="Press the back arrow (←) at the top left of the detail page, or use your browser's Back button, to return to the search list."
          imageCaption="Back arrow button highlighted at the top of the detail page"
        />
        <Tip text="You can also reach any city's detail page by tapping its card on the Home page or the Favourites page." />
      </Section>

      {/* ── 4. Favourites ────────────────────────────────────────────────────── */}
      <Section
        id="favourites"
        icon={Heart}
        iconColor="#dc2626"
        iconBg="#fef2f2"
        sectionLabel="Feature 4"
        title="Adding &amp; Viewing Favourites"
      >
        <StepRow
          number={1}
          title="Find a city you want to save"
          description="Use Search or the Home page to find a city you check regularly. Click on the city card to open its detail page."
          imageCaption="City detail page ready to be saved as a favourite"
        />
        <StepRow
          number={2}
          title="Tap the heart icon"
          description="On the detail page click the heart icon (♥) near the city name. It turns red to confirm the city is saved to your Favourites."
          imageCaption="Heart icon highlighted — showing the red saved state"
        />
        <StepRow
          number={3}
          title="Open the Favourites page"
          description='Click "Favorites" in the top navigation bar. All your saved cities are listed here with their live AQI readings.'
          imageCaption="Favourites page showing a list of saved city cards"
        />
        <StepRow
          number={4}
          title="Tap a favourite to check details"
          description="From the Favourites page, tap any city card to go directly to its full detail page — the quickest way to check places that matter to you."
          imageCaption="Tapping a favourite card to navigate to the detail page"
        />
        <StepRow
          number={5}
          title="Remove a favourite"
          description="To remove a saved city, open the Favourites page and click the red bin icon on the right side of the city card. It is removed immediately."
          imageCaption="Red bin/trash icon highlighted on a favourite card"
        />
        <Tip text="Your favourites are saved on your device and will still be there the next time you open MyAirSafe — even after closing the browser." />
      </Section>

      {/* ── 5. Settings ──────────────────────────────────────────────────────── */}
      <Section
        id="settings"
        icon={Settings}
        iconColor="#7c3aed"
        iconBg="#f5f3ff"
        sectionLabel="Feature 5"
        title="Settings &amp; Preferences"
      >
        <StepRow
          number={1}
          title="Open the Settings page"
          description='Click "Settings" in the top navigation bar. You will see all customisation options arranged in sections.'
          imageCaption="Settings page overview showing all available options"
        />
        <StepRow
          number={2}
          title="Change language"
          description="Under Localisation, click the Language dropdown and choose English, Bahasa Melayu, 中文 (Chinese), or தமிழ் (Tamil). The app changes immediately."
          imageCaption="Language dropdown open showing the four language choices"
        />
        <StepRow
          number={3}
          title="Turn on air quality alerts"
          description="Under General, toggle Air Quality Alerts to ON (blue). Your browser will ask permission — click Allow. You will be notified when air quality is poor."
          imageCaption="Notifications toggle in the ON (blue) position"
        />
        <StepRow
          number={4}
          title="Switch to Dark Mode"
          description="Toggle Dark Mode to ON to change the background to a dark theme. Toggle it again to return to the normal bright view."
          imageCaption="The app displayed in Dark Mode with a dark background"
        />
        <StepRow
          number={5}
          title="Change measurement units"
          description="Under Localisation choose Metric (°C, km) or Imperial (°F, miles). Most users in Malaysia use Metric."
          imageCaption="Units setting showing Metric selected"
        />
        <StepRow
          number={6}
          title="Save or reset your settings"
          description='Click "Save Changes" (blue button at the bottom) to save your preferences. Click "Reset Defaults" to undo all changes and return to the original settings.'
          imageCaption="Save Changes and Reset Defaults buttons at the bottom of Settings"
        />
        <Tip text="Settings are stored on your device only. If you use a different phone or computer you will need to set your preferences again on that device." />
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