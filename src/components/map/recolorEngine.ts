/* ============================================================
 * 🎨 MapWalls — Pixel Recolor Engine
 *
 * Per-pixel color classification for CartoDB light_nolabels
 * tiles. Each pixel is matched to {water, land, road} and
 * re-mapped to the target style colour.
 *
 * Reference source palette (CartoDB "light_nolabels"):
 *   Land:  rgb(248, 248, 246)  #f8f8f6
 *   Water: rgb(212, 221, 225)  #d4dde1
 *   Road:  rgb(227, 227, 227)  #e3e3e3
 *   Park:  rgb(232, 238, 233)  #e8eee9  → mapped to land
 * ============================================================ */

import type { MapStyleDef } from '../../styles/mapStyles'

/* ─── Reference RGB values (CartoDB "light_nolabels") ─────── */
const REF = {
  water: { r: 212, g: 221, b: 225 },
  land:  { r: 248, g: 248, b: 246 },
  road:  { r: 227, g: 227, b: 227 },
} as const

/* ─── Hex → RGB tuple ──────────────────────────────────────── */
function hexToRGB(hex: string): [number, number, number] {
  const c = hex.replace('#', '')
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
  ]
}

/* ─── Squared Euclidean distance ────────────────────────────── */
function sqDist(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number,
): number {
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2
  return dr * dr + dg * dg + db * db
}

/* ─── Thresholds (tuned for light_nolabels) ────────────────── */
const WATER_BLUE_THRESHOLD = 2   // b must exceed max(r,g) by this
const WATER_MIN_BLUE      = 218  // minimum blue channel for water
const GRAY_RANGE_ROAD     = 14   // max-min for road grays
const ROAD_MAX_BRIGHTNESS = 240  // road pixels never exceed this
const LAND_MIN_BRIGHTNESS = 240  // land pixels are at least this
const LAND_GRAY_RANGE     = 18   // max allowed range for land
const PARK_G_MIN          = 225  // green channel minimum for parks
const NEIGHBOUR_CAP_WATER = 600  // squared distance cap for water
const NEIGHBOUR_CAP_ROAD  = 500  // squared distance cap for road

/* ─── Pixel classification ──────────────────────────────────── */
type PixelClass = 'water' | 'land' | 'road'

function classifyPixel(r: number, g: number, b: number): PixelClass {
  /* Water — blue-tinted pixels */
  if (b > Math.max(r, g) + WATER_BLUE_THRESHOLD && b > WATER_MIN_BLUE)
    return 'water'
  if (b > g + 4 && b > r + 4 && b > 210)
    return 'water'

  const maxC = Math.max(r, g, b)
  const minC = Math.min(r, g, b)
  const range = maxC - minC

  /* Road — neutral gray, distinctly darker than land */
  if (range < GRAY_RANGE_ROAD && maxC < ROAD_MAX_BRIGHTNESS)
    return 'road'
  if (range < 10 && maxC < 244)
    return 'road'

  /* Bright / near-white → land */
  if (maxC >= LAND_MIN_BRIGHTNESS && range < LAND_GRAY_RANGE)
    return 'land'

  /* Green-ish tint → park → land */
  if (g > Math.max(r, b) && g - Math.min(r, b) > 4 && g > PARK_G_MIN)
    return 'land'

  /* Fallback — nearest neighbour distance match */
  const dWater = sqDist(r, g, b, REF.water.r, REF.water.g, REF.water.b)
  const dLand  = sqDist(r, g, b, REF.land.r,  REF.land.g,  REF.land.b)
  const dRoad  = sqDist(r, g, b, REF.road.r,  REF.road.g,  REF.road.b)

  if (dWater < dLand && dWater < dRoad && dWater < NEIGHBOUR_CAP_WATER)
    return 'water'
  if (dRoad < dLand && dRoad < NEIGHBOUR_CAP_ROAD)
    return 'road'
  return 'land'
}

/* ─── Main recolor function ─────────────────────────────────── */
export function recolorTilePixels(
  data: Uint8ClampedArray,
  style: MapStyleDef,
): void {
  const tWater = hexToRGB(style.water)
  const tLand  = hexToRGB(style.land)
  const tRoad  = hexToRGB(style.roads)

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue  // skip transparent

    const cls = classifyPixel(data[i], data[i + 1], data[i + 2])

    switch (cls) {
      case 'water':
        data[i] = tWater[0]; data[i + 1] = tWater[1]; data[i + 2] = tWater[2]
        break
      case 'road':
        data[i] = tRoad[0]; data[i + 1] = tRoad[1]; data[i + 2] = tRoad[2]
        break
      case 'land':
      default:
        data[i] = tLand[0]; data[i + 1] = tLand[1]; data[i + 2] = tLand[2]
        break
    }
  }
}
