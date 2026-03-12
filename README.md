## Air Quality Dashboard – Frontend

React + TypeScript + Vite SPA that implements the air quality dashboard from Figma.

---

## Folder structure

Top-level (selected):

- `package.json` – dependencies and scripts
- `vite.config.ts` – Vite + React config, `@` alias → `src`
- `tsconfig*.json` – TypeScript configs
- `postcss.config.cjs` / `tailwind.config.cjs` – Tailwind and PostCSS
- `index.html` – Vite entry HTML
- `src/` – application source

`src/`:

- `main.tsx` – React entry point, mounts `<App />` and imports global styles
- `App.tsx` – top-level providers (React Router, React Query, app/auth context) and `<AppRoutes />`
- `index.css` – Tailwind directives and global base styles

Routing & layout:

- `routes/AppRoutes.tsx` – all routes
  - `/` → `HomePage`
  - `/search` → `SearchPage`
  - `/favorites` → `FavoritesPage`
  - `/settings` → `SettingsPage`
  - `/compare` → `CompareLocationsPage`
  - `/location/:cityName` → `LocationDetailPage`
- `components/Layout/Header.tsx` – top navigation bar
- `components/Layout/Footer.tsx` – footer with attribution/copyright
- `components/Layout/RootLayout.tsx` – wraps header, sidebar navigation, routed content, and footer

Pages:

- `pages/HomePage.tsx` – main dashboard, quick stats, map placeholder, featured locations, locations grid
- `pages/SearchPage.tsx` – search for locations and jump to detail view
- `pages/FavoritesPage.tsx` – simple favorites list UI
- `pages/SettingsPage.tsx` – notification, theme, language, and units settings
- `pages/CompareLocationsPage.tsx` – side‑by‑side comparison of two locations
- `pages/LocationDetailPage.tsx` – detailed view for a single location (metrics, trend chart, recommendations)

Shared data & context:

- `data/locations.ts` – static location list and helpers (status color/label)
- `context/AppContext.tsx` – app‑level context (extend as needed)
- `context/AuthContext.tsx` – auth‑related context (currently placeholder)

---

## Getting started (dev)

**Prerequisites**

- Node.js 18+ (recommended)  
- npm (ships with Node)

**Install dependencies**

```bash
npm install
```

**Run dev server**

```bash
npm run dev
```

Then open the printed URL (typically `http://localhost:5173`) in your browser.

Vite provides hot module replacement (HMR), so changes under `src/` will reload in place.

---

## Build & preview

**Create a production build**

```bash
npm run build
```

This outputs static assets to the `dist/` folder.

**Preview the production build locally**

```bash
npm run preview
```

This serves the contents of `dist/` with Vite’s preview server.

---

## Linting

To run ESLint on the project:

```bash
npm run lint
```

Lint rules are configured in `eslint.config.js`.

---

## Notes for contributors

- Use the existing routes and layout components (`AppRoutes`, `RootLayout`, `Header`, `Footer`) when adding new pages.
- Reuse `data/locations.ts` or migrate to real API data in the backend when it becomes available.
- Prefer TypeScript (`.tsx` / `.ts`) and keep new source files under `src/`.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
