# AGENTS.md — MapWalls

## Commands

```
npm run dev       # Vite dev server (exposed on network, allows tunnels)
npm run build     # tsc -b && vite build  ← typecheck FIRST, fails build on errors
npm run lint      # eslint .
npm run preview   # vite preview (production build preview)
```

Build **requires** typecheck to pass (`tsc -b`). If you skip to `vite build`, types aren't checked.

## Architecture

Single-page React 19 app with Leaflet maps, glassmorphism UI, and per-pixel tile recoloring.

```
src/
  main.tsx          → ThemeProvider → <App />
  App.tsx           → toolbar + device frame preview + search bar
  components/
    device/         — DeviceFrame, DeviceDropdown, aspect ratio presets
    map/            — MapView, SearchBar, useGeocode (Nominatim), mapCapture, recolorEngine
    ui/             — ThemeToggle, GlassButton/Card/Input, StyleSelector, DownloadButton
  styles/
    mapStyles.ts    — 20 map color styles (Dark/Light/Vibrant) with land/water/road/accent
  themes/
    global.css      — CSS custom properties, driven by `data-theme` on <html>
    tokens.ts       — design tokens (colors, spacing, radii, fonts, shadows)
    glass.ts        — programmatic glassmorphism style helpers
    ThemeContext.tsx — theme state via useSyncExternalStore + localStorage + cross-tab sync
```

Every component directory has a barrel `index.ts` — import from the directory, not individual files.

## TypeScript strictness

- **`verbatimModuleSyntax: true`** — must use `import type { X }` for type-only imports. Forgetting `type` will cause a build error.
- **`erasableSyntaxOnly: true`** — no enums, no namespaces. Use `as const` objects instead.
- **`noUnusedLocals: true`**, **`noUnusedParameters: true`** — unused imports/variables are errors.

## Theming

- Theme is toggled by setting `data-theme="dark|light"` on `<html>` — **not** by class swapping.
- All visual properties come from CSS custom properties defined in `global.css` under `:root` / `:root[data-theme='dark']` / `:root[data-theme='light']`.
- The ThemeContext uses `useSyncExternalStore` (not useState) to sync across tabs via synthetic `StorageEvent` dispatch. localStorage key is `"mapwalls-theme"`.
- Glassmorphism surfaces use `var(--glass-*-bg)` / `var(--glass-*-border)` / `var(--glass-*-blur)` CSS variables, or the programmatic `glass()` helper from `themes/glass.ts`.

## Map / Tile recoloring

- Tiles are fetched from CartoDB `light_nolabels`, then every pixel is classified (water/land/road) and remapped to the selected map style's colors via `recolorEngine.ts`.
- The custom `TileRecolorLayer` extends `L.TileLayer`, serves recolored tiles via `blob://` URLs. Style changes trigger `layer.redraw()`.
- `mapCapture.ts` renders tiles at native 256×256, crops to viewport, then scales to QHD/4K/8K resolution.
- `LeafletMap` refs use `React.RefObject<LeafletMap | null>` (React 19 typing).

## Dependencies

- **React 19.2** (no React Compiler)
- **react-leaflet 5** + **leaflet 1.9** — `leaflet/dist/leaflet.css` must be imported in `main.tsx`
- **lucide-react** for icons
- **Nominatim** geocoding (OpenStreetMap) — requires `User-Agent: MapWalls/1.0` header
