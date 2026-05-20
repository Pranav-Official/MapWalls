/* ============================================================
 * 🎨 MapWalls — Tile Recolor Layer
 *
 * Custom Leaflet TileLayer that loads original tiles offscreen,
 * recolours every pixel via canvas, then serves the result as a
 * blob:// URL to standard <img> tiles. Uses Leaflet's built-in
 * img tile lifecycle (load/error events & done callback).
 *
 * Style changes trigger a full redraw. No flicker on pan/zoom.
 * ============================================================ */

import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { recolorTilePixels } from './recolorEngine'
import type { MapStyleDef } from '../../styles/mapStyles'

/* ─── Tile config (no labels!) ──────────────────────────────── */
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png'
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, &copy; CARTO'

/* ─── Cache original ImageData per tile URL ─────────────────── */
const originalCache = new Map<string, ImageData>()
const MAX_CACHE = 300

/* ─── React component ───────────────────────────────────────── */
interface Props {
  style: MapStyleDef
}

export function TileRecolorLayer({ style }: Props) {
  const map = useMap()
  const styleRef = useRef(style)
  const layerRef = useRef<L.TileLayer | null>(null)
  const prevStyleId = useRef<string | null>(null)

  styleRef.current = style

  /* ── Mount / unmount ── */
  useEffect(() => {
    const Cls = L.TileLayer.extend({

      createTile(coords: L.Coords, done: L.DoneCallback) {
        /* Standard <img> tile with Leaflet's event plumbing */
        const tile = document.createElement('img') as HTMLImageElement
        L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile))
        L.DomEvent.on(tile, 'error', L.Util.bind(this._tileOnError, this, done, tile))
        tile.crossOrigin = 'anonymous'
        tile.alt = ''

        const url = this.getTileUrl(coords)

        /* ── Offscreen recolor pipeline ── */
        const loader = new Image()
        loader.crossOrigin = 'anonymous'

        loader.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            const w = loader.naturalWidth
            const h = loader.naturalHeight
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext('2d')!
            ctx.drawImage(loader, 0, 0)

            /* Cache original */
            const raw = ctx.getImageData(0, 0, w, h)
            if (!originalCache.has(url)) {
              if (originalCache.size >= MAX_CACHE) {
                const first = originalCache.keys().next().value
                if (first) originalCache.delete(first)
              }
              originalCache.set(url, new ImageData(
                new Uint8ClampedArray(raw.data), w, h,
              ))
            }

            /* Recolor and serve as blob */
            recolorTilePixels(raw.data, styleRef.current)
            ctx.putImageData(raw, 0, 0)

            ctx.canvas.toBlob((blob) => {
              if (blob) {
                tile.src = URL.createObjectURL(blob)
              } else {
                tile.src = url /* fallback */
              }
            })
          } catch (_err) {
            tile.src = url /* fallback on any error */
          }
        }

        loader.onerror = () => { tile.src = url }
        loader.src = url

        return tile
      },
    })

    const layer = new Cls(TILE_URL, {
      attribution: TILE_ATTR,
      crossOrigin: 'anonymous',
    })

    map.addLayer(layer)
    layerRef.current = layer

    return () => {
      map.removeLayer(layer)
      originalCache.clear()
    }
  }, [map])

  /* ── Redraw on style change ── */
  useEffect(() => {
    if (!layerRef.current) return
    if (style.id === prevStyleId.current) return
    prevStyleId.current = style.id
    layerRef.current.redraw()
  }, [style])

  return null
}
