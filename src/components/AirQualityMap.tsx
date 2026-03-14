import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Location } from '@/data/locations'
import { getAQIMeta } from '@/utils/aqiHelpers'

interface Props {
  locations: Location[]
  userLoc: { lat: number; lng: number } | null
  selectedLocation: Location | null
  onSelectLocation: (loc: Location) => void
}

function createAQIIcon(aqi: number, color: string, isSelected: boolean) {
  const size = isSelected ? 46 : 38
  const fontSize = aqi >= 100 ? '10px' : '12px'
  return L.divIcon({
    className: '',
    html: `<div style="
      background:${color};
      color:#fff;
      border-radius:50%;
      width:${size}px;
      height:${size}px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:800;
      font-size:${fontSize};
      font-family:Inter,sans-serif;
      border:${isSelected ? '3px' : '2.5px'} solid #fff;
      box-shadow:0 2px 10px rgba(0,0,0,${isSelected ? '0.45' : '0.28'})${isSelected ? `,0 0 0 4px ${color}55` : ''};
      cursor:pointer;
    ">${Math.round(aqi)}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function createUserIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="
      background:#1d4ed8;
      border-radius:50%;
      width:16px;
      height:16px;
      border:3px solid #fff;
      box-shadow:0 0 0 3px rgba(29,78,216,0.35),0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function MapFlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo(target, 11, { duration: 1.4 })
  }, [target, map])
  return null
}

export function AirQualityMap({ locations, userLoc, selectedLocation, onSelectLocation }: Props) {
  const flyTarget: [number, number] | null = userLoc
    ? [userLoc.lat, userLoc.lng]
    : selectedLocation
    ? [selectedLocation.lat, selectedLocation.lng]
    : null

  return (
    <MapContainer
      center={[4.2, 108.5]}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapFlyTo target={flyTarget} />

      {locations.map(loc => {
        const meta = getAQIMeta(loc.status)
        const isSelected = selectedLocation?.id === loc.id
        return (
          <Marker
            key={loc.id}
            position={[loc.lat, loc.lng]}
            icon={createAQIIcon(loc.aqi, meta.color, isSelected)}
            zIndexOffset={isSelected ? 1000 : 0}
            eventHandlers={{ click: () => onSelectLocation(loc) }}
          />
        )
      })}

      {userLoc && (
        <Marker position={[userLoc.lat, userLoc.lng]} icon={createUserIcon()} />
      )}
    </MapContainer>
  )
}
