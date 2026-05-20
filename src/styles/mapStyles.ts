/* ============================================================
 * 🎨 MapWalls — Map Color Styles
 *
 * 20 curated map styles (6 light + 7 dark + 7 vibrant) with
 * land, water, road, and accent color definitions. Each style
 * is applied via per-pixel recolorization of CartoDB tiles.
 * ============================================================ */

export interface MapStyleDef {
  /** Unique identifier (kebab-case) */
  id: string
  /** Display name */
  name: string
  /** Group category */
  category: 'Dark' | 'Light' | 'Vibrant'
  /** Emoji icon */
  icon: string
  /** Land fill colour (hex) */
  land: string
  /** Water fill colour (hex) */
  water: string
  /** Road / boundary colour (hex) */
  roads: string
  /** Accent / highlight colour (hex) */
  accent: string
  /** 4-colour palette for the visual swatch [water, land, roads, accent] */
  palette: [string, string, string, string]
}

/* ════════════════════════════════════════════════════════════
 * Dark styles
 * ════════════════════════════════════════════════════════════ */
const DARK: Omit<MapStyleDef, 'id' | 'palette'>[] = [
  { name: 'Midnight', category: 'Dark', icon: '🌙',
    land: '#1a1a24', water: '#0f0f15', roads: '#2d2d3d', accent: '#ff5e7e' },
  { name: 'Obsidian',  category: 'Dark', icon: '🪨',
    land: '#121212', water: '#1f2326', roads: '#2c2c2c', accent: '#00ffcc' },
  { name: 'Cyber',     category: 'Dark', icon: '💠',
    land: '#0b0c10', water: '#1f2833', roads: '#45a29e', accent: '#66fcf1' },
  { name: 'Nordic',    category: 'Dark', icon: '❄️',
    land: '#2e3440', water: '#3b4252', roads: '#4c566a', accent: '#88c0d0' },
  { name: 'Basalt',    category: 'Dark', icon: '🌋',
    land: '#232526', water: '#414345', roads: '#5c5c5c', accent: '#f39c12' },
  { name: 'Nebula',    category: 'Dark', icon: '🌌',
    land: '#1b1429', water: '#3c195d', roads: '#7209b7', accent: '#f72585' },
  { name: 'Ember',     category: 'Dark', icon: '🔥',
    land: '#1e130c', water: '#960018', roads: '#4a3b32', accent: '#ff4500' },
]

/* ════════════════════════════════════════════════════════════
 * Light styles
 * ════════════════════════════════════════════════════════════ */
const LIGHT: Omit<MapStyleDef, 'id' | 'palette'>[] = [
  { name: 'Alabaster', category: 'Light', icon: '☀️',
    land: '#f7f7f7', water: '#e3edf7', roads: '#ffffff', accent: '#ff6b6b' },
  { name: 'Sahara',    category: 'Light', icon: '🏜️',
    land: '#f4eade', water: '#d5e0ea', roads: '#ffffff', accent: '#e29578' },
  { name: 'Sage',      category: 'Light', icon: '🌿',
    land: '#f1f3f0', water: '#d2dbd3', roads: '#ffffff', accent: '#8a9a86' },
  { name: 'Glacier',   category: 'Light', icon: '🧊',
    land: '#f0f4f8', water: '#bcccdc', roads: '#ffffff', accent: '#486581' },
  { name: 'Quartz',    category: 'Light', icon: '💎',
    land: '#faf5ff', water: '#e8dff5', roads: '#ffffff', accent: '#b185db' },
  { name: 'Parchment', category: 'Light', icon: '📜',
    land: '#fcf8f2', water: '#dfedd6', roads: '#ffffff', accent: '#606c38' },
]

/* ════════════════════════════════════════════════════════════
 * Vibrant styles
 * ════════════════════════════════════════════════════════════ */
const VIBRANT: Omit<MapStyleDef, 'id' | 'palette'>[] = [
  { name: 'Neon',     category: 'Vibrant', icon: '💜',
    land: '#000000', water: '#0000ff', roads: '#ffff00', accent: '#ff00ff' },
  { name: 'Magma',    category: 'Vibrant', icon: '🌋',
    land: '#3b0000', water: '#000000', roads: '#ff4500', accent: '#ffcc00' },
  { name: 'Miami',    category: 'Vibrant', icon: '🌴',
    land: '#2c1b4d', water: '#00b4d8', roads: '#ff007f', accent: '#9b5de5' },
  { name: 'Atlantis', category: 'Vibrant', icon: '🌊',
    land: '#113f48', water: '#00f5d4', roads: '#ffffff', accent: '#fee440' },
  { name: 'Candy',    category: 'Vibrant', icon: '🍬',
    land: '#fff0f5', water: '#ffb6c1', roads: '#ff69b4', accent: '#00f5d4' },
  { name: 'Retro',    category: 'Vibrant', icon: '📺',
    land: '#f4ebd0', water: '#167d7f', roads: '#29a19c', accent: '#ff6f3c' },
  { name: 'Aurora',   category: 'Vibrant', icon: '🌌',
    land: '#050c1a', water: '#0b2545', roads: '#3a86c8', accent: '#52b788' },
]

/* ════════════════════════════════════════════════════════════
 * Build full list with id + palette
 * ════════════════════════════════════════════════════════════ */
function toId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function buildWithPalette(
  styles: Omit<MapStyleDef, 'id' | 'palette'>[],
): MapStyleDef[] {
  return styles.map((s) => ({
    ...s,
    id: toId(s.name),
    palette: [s.water, s.land, s.roads, s.accent] as [string, string, string, string],
  }))
}

export const MAP_STYLES: MapStyleDef[] = [
  ...buildWithPalette(DARK),
  ...buildWithPalette(LIGHT),
  ...buildWithPalette(VIBRANT),
]

/** Helper — look up a style by id */
export function getStyleById(id: string): MapStyleDef | undefined {
  return MAP_STYLES.find((s) => s.id === id)
}

/** Default style id */
export const DEFAULT_STYLE_ID = 'midnight'
