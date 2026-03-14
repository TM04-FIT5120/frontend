# Backend Endpoints Report (Frontend-Only Implementation)

This report lists backend API endpoints that are **not** currently available but would be needed to fully satisfy the Acceptance Criteria. The current frontend implementation uses existing endpoints where possible and uses static/derived data or placeholders where backend support is missing.

---

## Currently Used Backend Endpoints

- **GET** `/api/airQuality/airQualityDefaut` — default air quality (used by frontend base URL; backend may expose at `/airQualityDefaut` without prefix).
- **GET** `/api/airQuality/airQualityByCityOrLocation?city=xxx` — air quality by city/location name. **Used for AC 1.1.2** (search by arbitrary location).
- **GET** `/api/airQuality/airQualityByCityOrLocation?Latitude=x&Longitude=y` — air quality by coordinates. **Used for AC 1.1.1** (current location).
- **GET** `/api/favorites/*` — favorites CRUD. Not required by ACs but implemented.

Response shape includes `aqi`, `cityName`, `pm25Forecast` (array of `{ day, avg, min, max }`), `recommendation`, etc. The frontend uses this for Short-term forecast (daily buckets); risk categories and activity recommendations are computed on the frontend per AC 1.2.1 and AC 1.2.2.

---

## New Endpoints Recommended for Full AC Compliance

### 1. Short-Term Forecast — 24-Hour Time Blocks (AC 2.1.1, AC 2.1.2)

**AC 2.1.1** requires predicted PM2.5/API for the **following 24 hours** (not only daily).  
**AC 2.1.2** requires suggestions when a **time block** (e.g. 6:00–9:00) is Unhealthy/High Risk.

- **Suggested endpoint:** e.g.  
  `GET /api/airQuality/forecast/24h?city=xxx`  
  or  
  `GET /api/airQuality/forecast/24h?Latitude=x&Longitude=y`

- **Suggested response shape:**  
  Array of time-block objects, e.g.  
  `{ start: "2025-03-16T06:00:00", end: "2025-03-16T09:00:00", aqi: number, pm25: number }`  
  so the frontend can show “Next 24 hours” by block and show “Adjust Routine” / “Not recommend going outdoors” for unhealthy blocks.

- **Note:** Current backend returns only **daily** `pm25Forecast` (e.g. from WAQI daily forecast). The frontend uses that for a “next day” and multi-day view and shows activity recommendations when any day is unhealthy; time-block-level behaviour would require this new endpoint (or equivalent).

---

### 2. Long-Term / Seasonal Forecast (AC 2.2.1)

**AC 2.2.1** requires historical data, recurring seasonal patterns, and a calendar-style view with labels like “Haze Season” and colour by severity.

- **Suggested endpoint:** e.g.  
  `GET /api/airQuality/forecast/seasonal?region=malaysia`  
  or  
  `GET /api/airQuality/historical/patterns?city=xxx`

- **Suggested response shape:**  
  e.g. monthly or seasonal risk indicators:  
  `{ month: number, label: string, riskCategory: string, avgAqi?: number }[]`  
  so the frontend can render a calendar-style view and label high-risk periods (e.g. “Haze Season”) with the same risk colours as AC 1.2.1.

- **Note:** The frontend currently uses a **static** calendar (e.g. June–October as “Haze Season”) and does not call any backend for historical or seasonal data. A new endpoint would allow data-driven long-term views.

---

### 3. Proactive High-Risk Period (AC 2.2.2)

**AC 2.2.2** requires a proactive notice when the user is **within 2 weeks** of a historically high-risk period, with a link to activity planning (Forecast).

- The frontend implements this with **client-side date logic** (e.g. within 2 weeks of June 1 or inside haze months). No backend call is required for the current behaviour.
- Optionally, the backend could expose:  
  `GET /api/airQuality/riskPeriods?region=malaysia`  
  returning e.g. `{ start: date, end: date, label: string }[]` so the frontend can show notices and links to Forecast based on server-defined risk periods instead of hard-coded dates.

---

## Path Mismatch Reminder

The frontend calls:

- `BASE_URL + /api/airQuality/airQualityDefaut`
- `BASE_URL + /api/airQuality/airQualityByCityOrLocation?city=...`

The backend controller currently maps:

- `/airQualityDefaut`
- `/airQualityByCityOrLocation`

So the backend must expose these under `/api/airQuality/` (e.g. via `@RequestMapping("/api/airQuality")` on the controller or a context path / reverse proxy) for the frontend to reach them without change.
