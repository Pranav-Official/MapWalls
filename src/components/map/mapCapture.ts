/* ============================================================
 * 🎨 MapWalls — High-Resolution Map Capture
 *
 * 1. Fetches retina @2x tiles (512×512) at the same zoom
 * 2. Renders tiles at physical 512×512 resolution
 * 3. Crops to exact viewport bounds
 * 4. Scales to target QHD/4K/8K resolution
 *
 * Using @2x tiles gives 4× the source pixels at the same zoom,
 * so the final upscale is minimal and the image stays crisp.
 * ============================================================ */

import type { Map } from 'leaflet'
import type { MapStyleDef } from '../../styles/mapStyles'
import { recolorTilePixels } from './recolorEngine'

const TILE_URL =
  'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png'
const SUBDOMAINS = ['a', 'b', 'c']

/* ─── Tile sizing ───────────────────────────────────────────── */
const CONCEPTUAL_TS = 256   // world-pixel tile size (for coordinate math)
const TILE_SCALE = 2        // @2x retina multiplier
const PHYSICAL_TS = CONCEPTUAL_TS * TILE_SCALE  // 512px actual tile images

export interface ResolutionPreset {
  label: string
  megapixels: number
}

export const RESOLUTIONS: ResolutionPreset[] = [
  { label: 'QHD', megapixels: 3.7 },
  { label: '4K',  megapixels: 8.3 },
  { label: '8K',  megapixels: 33.2 },
]

/** Compute target canvas size preserving aspect ratio */
export function computeTargetSize(
  vw: number,
  vh: number,
  preset: ResolutionPreset,
): [number, number] {
  const ratio = vw / vh
  const totalPx = preset.megapixels * 1_000_000
  const w = Math.round(Math.sqrt(totalPx * ratio))
  const h = Math.round(w / ratio)
  return [w, h]
}

/* ─── Tile helpers ──────────────────────────────────────────── */
function subdomain(x: number, y: number): string {
  return SUBDOMAINS[Math.abs(x + y) % SUBDOMAINS.length]
}

function tileUrl(zoom: number, x: number, y: number): string {
  const numTiles = Math.pow(2, zoom)
  const wx = ((x % numTiles) + numTiles) % numTiles
  const clampedY = Math.max(0, Math.min(y, numTiles - 1))
  return TILE_URL
    .replace('{s}', subdomain(wx, clampedY))
    .replace('{z}', String(zoom))
    .replace('{x}', String(wx))
    .replace('{y}', String(clampedY))
    .replace('{r}', '@2x')
}

function loadTile(
  zoom: number,
  x: number,
  y: number,
  style: MapStyleDef,
): Promise<ImageData> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = PHYSICAL_TS
    canvas.height = PHYSICAL_TS
    const ctx = canvas.getContext('2d')!

    const numTiles = Math.pow(2, zoom)
    if (y < 0 || y >= numTiles) {
      ctx.fillStyle = style.land
      ctx.fillRect(0, 0, PHYSICAL_TS, PHYSICAL_TS)
      resolve(ctx.getImageData(0, 0, PHYSICAL_TS, PHYSICAL_TS))
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      const data = ctx.getImageData(0, 0, PHYSICAL_TS, PHYSICAL_TS)
      recolorTilePixels(data.data, style)
      resolve(data)
    }
    img.onerror = () => {
      ctx.fillStyle = style.land
      ctx.fillRect(0, 0, PHYSICAL_TS, PHYSICAL_TS)
      resolve(ctx.getImageData(0, 0, PHYSICAL_TS, PHYSICAL_TS))
    }
    img.src = tileUrl(zoom, x, y)
  })
}

/* ─── Result ────────────────────────────────────────────────── */
export interface CaptureResult {
  blob: Blob
  width: number
  height: number
}

/* ─── Main capture ──────────────────────────────────────────── */
export async function captureMapViewport(
  map: Map,
  targetW: number,
  targetH: number,
  style: MapStyleDef,
  onProgress?: (loaded: number, total: number) => void,
): Promise<CaptureResult> {
  const zoom = map.getZoom()
  const bounds = map.getBounds()

  /* ── Viewport in world-pixel coords at this zoom ── */
  const nw = map.project(bounds.getNorthWest(), zoom)
  const se = map.project(bounds.getSouthEast(), zoom)

  const left = Math.min(nw.x, se.x)
  const top  = Math.min(nw.y, se.y)
  const vw   = Math.abs(se.x - nw.x)  // viewport width  in world px
  const vh   = Math.abs(se.y - nw.y)  // viewport height in world px

  /* ── Tile grid covering the viewport (in conceptual 256px units) ── */
  const minTX = Math.floor(left / CONCEPTUAL_TS)
  const maxTX = Math.ceil((left + vw) / CONCEPTUAL_TS) - 1
  const minTY = Math.floor(top / CONCEPTUAL_TS)
  const maxTY = Math.ceil((top + vh) / CONCEPTUAL_TS) - 1

  const tilesX = maxTX - minTX + 1
  const tilesY = maxTY - minTY + 1

  /* ── Step 1: render all tiles at physical 512×512 ── */
  const tileCanvas = document.createElement('canvas')
  tileCanvas.width  = tilesX * PHYSICAL_TS
  tileCanvas.height = tilesY * PHYSICAL_TS
  const tileCtx = tileCanvas.getContext('2d')!

  const tempC = document.createElement('canvas')
  tempC.width  = PHYSICAL_TS
  tempC.height = PHYSICAL_TS
  const tempCtx = tempC.getContext('2d')!

  const total = tilesX * tilesY
  let loaded = 0

  for (let tx = minTX; tx <= maxTX; tx++) {
    for (let ty = minTY; ty <= maxTY; ty++) {
      const data = await loadTile(zoom, tx, ty, style)
      const dx = (tx - minTX) * PHYSICAL_TS
      const dy = (ty - minTY) * PHYSICAL_TS
      tempCtx.putImageData(data, 0, 0)
      tileCtx.drawImage(tempC, dx, dy)

      loaded++
      if (onProgress) onProgress(loaded, total)
    }
  }

  /* ── Step 2: crop to exact viewport bounds (scaled to physical px) ── */
  const cropX = Math.round((left - minTX * CONCEPTUAL_TS) * TILE_SCALE)
  const cropY = Math.round((top - minTY * CONCEPTUAL_TS) * TILE_SCALE)
  const cropW = Math.round(vw * TILE_SCALE)
  const cropH = Math.round(vh * TILE_SCALE)

  /* ── Step 3: scale to target resolution (smooth bilinear) ── */
  const outCanvas = document.createElement('canvas')
  outCanvas.width  = targetW
  outCanvas.height = targetH
  const outCtx = outCanvas.getContext('2d')!
  outCtx.imageSmoothingEnabled = true
  outCtx.imageSmoothingQuality = 'high'

  outCtx.drawImage(tileCanvas, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH)

  const blob = await new Promise<Blob>((resolve) => {
    outCanvas.toBlob((b) => resolve(b!), 'image/png')
  })

  return { blob, width: targetW, height: targetH }
}
