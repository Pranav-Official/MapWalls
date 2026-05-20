import { useState, useCallback, useRef } from 'react'
import { ThemeToggle, StyleSelector, DownloadButton } from './components/ui'
import { DeviceFrame, DeviceDropdown, DEFAULT_RATIO_ID, getRatioById } from './components/device'
import { MapView, SearchBar, useGeocode } from './components/map'
import { DEFAULT_STYLE_ID, getStyleById, type MapStyleDef } from './styles/mapStyles'
import type { AspectRatioOption } from './components/device'
import type { Map as LeafletMap } from 'leaflet'
import styles from './App.module.css'

function App() {
  const [activeRatio, setActiveRatio] = useState<AspectRatioOption>(
    () => getRatioById(DEFAULT_RATIO_ID)!,
  )
  const [mapStyle, setMapStyle] = useState<MapStyleDef>(
    () => getStyleById(DEFAULT_STYLE_ID)!,
  )
  const { result: geocodeResult, loading, error, search } = useGeocode()
  const mapRef = useRef<LeafletMap | null>(null)

  const handleSearch = useCallback(
    (query: string) => {
      search(query)
    },
    [search],
  )

  const handleMapReady = useCallback((map: LeafletMap) => {
    mapRef.current = map
  }, [])

  return (
    <div className={styles.page}>
      {/* ── Decorative orbs ── */}
      <div className={styles.orb} aria-hidden />
      <div className={`${styles.orb} ${styles.orb2}`} aria-hidden />

      {/* ── Toolbar ── */}
      <header className={styles.toolbar}>
        <div className={styles.brand}>
          <span className={styles.logo}>🧱</span>
          <span className={styles.title}>MapWalls</span>
        </div>

        <div className={styles.tools}>
          <DownloadButton mapRef={mapRef} style={mapStyle} />
          <ThemeToggle />
        </div>
      </header>

      {/* ── Device preview with map ── */}
      <main className={styles.preview}>
        <div className={styles.viewport}>
          <DeviceFrame ratio={activeRatio}>
            <MapView
              geocodeResult={geocodeResult}
              style={mapStyle}
              onMapReady={handleMapReady}
            />
          </DeviceFrame>
        </div>

        {/* ── Floating bottom toolbar ── */}
        <div className={styles.floatBar}>
          <DeviceDropdown
            activeId={activeRatio.id}
            onChange={setActiveRatio}
          />
          <span className={styles.floatBarDivider} />
          <StyleSelector activeId={mapStyle.id} onChange={setMapStyle} />
        </div>
      </main>

      {/* ── Bottom search bar ── */}
      <footer className={styles.footer}>
        <SearchBar onSearch={handleSearch} loading={loading} error={error} />
      </footer>
    </div>
  )
}

export default App
