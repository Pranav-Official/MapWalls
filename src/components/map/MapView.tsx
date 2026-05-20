/* ============================================================
 * 🗺️ MapWalls — Map View
 *
 * Leaflet map with per-pixel recolored tiles. Pinch-zoom and
 * pan enabled. Automatically re-centers when the geocode
 * result changes. Uses a ResizeObserver to keep the map in
 * sync when the device frame animates to a new aspect ratio.
 * ============================================================ */

import { useEffect, useRef } from 'react'
import { MapContainer, useMap } from 'react-leaflet'
import type { Map as LeafletMap } from 'leaflet'
import type { GeocodeResult } from './useGeocode'
import type { MapStyleDef } from '../../styles/mapStyles'
import { TileRecolorLayer } from './TileRecolorLayer'
import styles from './MapView.module.css'

/* ─── Default center ────────────────────────────────────────── */
const DEFAULT_CENTER: [number, number] = [20, 0]
const DEFAULT_ZOOM = 2

/* ════════════════════════════════════════════════════════════
 * MapResizer — watches the map element via ResizeObserver
 * and calls invalidateSize() so tiles fill the new container
 * dimensions after device frame transitions.
 * ════════════════════════════════════════════════════════════ */
function MapResizer({ map }: { map: LeafletMap }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const container = map.getContainer()
    if (!container) return

    const ro = new ResizeObserver(() => {
      map.invalidateSize()
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        map.invalidateSize()
      }, 500)
    })

    ro.observe(container)
    return () => {
      ro.disconnect()
      clearTimeout(timerRef.current)
    }
  }, [map])

  return null
}

/* ════════════════════════════════════════════════════════════
 * MapController — re-centers & zooms when geocode result changes
 * ════════════════════════════════════════════════════════════ */
function MapController({ result }: { result: GeocodeResult | null }) {
  const map = useMap()
  const prevKey = useRef<string>('')

  useEffect(() => {
    if (!result) return
    const key = `${result.lat.toFixed(4)}-${result.lng.toFixed(4)}`
    if (key === prevKey.current) return
    prevKey.current = key

    const [minLat, maxLat, minLng, maxLng] = result.boundingBox
    const latPad = Math.max((maxLat - minLat) * 0.3, 0.01)
    const lngPad = Math.max((maxLng - minLng) * 0.3, 0.01)

    map.fitBounds(
      [
        [minLat - latPad, minLng - lngPad],
        [maxLat + latPad, maxLng + lngPad],
      ],
      { padding: [20, 20], maxZoom: 16 },
    )
  }, [result, map])

  return null
}

/* ════════════════════════════════════════════════════════════
 * MapBoot — mounts inside MapContainer to wire up children
 * that need useMap()
 * ════════════════════════════════════════════════════════════ */
function MapBoot({
  onMapReady,
}: {
  onMapReady?: (map: LeafletMap) => void
}) {
  const map = useMap()

  useEffect(() => {
    onMapReady?.(map)
  }, [map, onMapReady])

  return (
    <>
      <MapResizer map={map} />
    </>
  )
}

/* ─── Props ─────────────────────────────────────────────────── */
interface MapViewProps {
  geocodeResult: GeocodeResult | null
  style: MapStyleDef
  onMapReady?: (map: LeafletMap) => void
}

/* ─── Component ─────────────────────────────────────────────── */
export function MapView({ geocodeResult, style, onMapReady }: MapViewProps) {
  return (
    <div className={styles.wrapper}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className={styles.map}
        zoomControl={true}
        scrollWheelZoom={true}
        touchZoom={true}
        dragging={true}
        doubleClickZoom={true}
        boxZoom={false}
        attributionControl={false}
      >
        <TileRecolorLayer style={style} />
        <MapController result={geocodeResult} />
        <MapBoot onMapReady={onMapReady} />
      </MapContainer>
    </div>
  )
}
