/* ============================================================
 * 📐 MapWalls — Aspect Ratio Config
 *
 * Single source of truth for all device aspect ratios.
 * iconName maps to lucide-react icon component names.
 * ============================================================ */

export type DeviceIconName = 'monitor' | 'smartphone' | 'tablet';

export interface AspectRatioOption {
  /** Unique id */
  id: string;
  /** Display label e.g. "16:9" */
  label: string;
  /** width / height */
  ratio: number;
  /** Lucide icon name */
  iconName: DeviceIconName;
  /** Device category label */
  category: string;
  /** Suggested device frame border radius (as fraction of smaller side) */
  frameRadius: number;
  /** Whether this is typically a phone (shows notch) */
  isPhone: boolean;
  /** Whether this is typically landscape */
  isLandscape: boolean;
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  // ── Desktop / Monitor ──
  {
    id: '16-9',
    label: '16:9',
    ratio: 16 / 9,
    iconName: 'monitor',
    category: 'Desktop',
    frameRadius: 0.02,
    isPhone: false,
    isLandscape: true,
  },
  {
    id: '21-9',
    label: '21:9',
    ratio: 21 / 9,
    iconName: 'monitor',
    category: 'Ultrawide',
    frameRadius: 0.015,
    isPhone: false,
    isLandscape: true,
  },
  {
    id: '4-3',
    label: '4:3',
    ratio: 4 / 3,
    iconName: 'monitor',
    category: 'Standard',
    frameRadius: 0.03,
    isPhone: false,
    isLandscape: true,
  },
  {
    id: '3-2',
    label: '3:2',
    ratio: 3 / 2,
    iconName: 'monitor',
    category: 'Photo',
    frameRadius: 0.025,
    isPhone: false,
    isLandscape: true,
  },

  // ── Phone ──
  {
    id: '9-16',
    label: '9:16',
    ratio: 9 / 16,
    iconName: 'smartphone',
    category: 'Phone',
    frameRadius: 0.08,
    isPhone: true,
    isLandscape: false,
  },
  {
    id: '9-21',
    label: '9:21',
    ratio: 9 / 21,
    iconName: 'smartphone',
    category: 'Tall Phone',
    frameRadius: 0.06,
    isPhone: true,
    isLandscape: false,
  },
  {
    id: '2-3',
    label: '2:3',
    ratio: 2 / 3,
    iconName: 'smartphone',
    category: 'Compact',
    frameRadius: 0.06,
    isPhone: true,
    isLandscape: false,
  },

  // ── Tablet ──
  {
    id: '3-4',
    label: '3:4',
    ratio: 3 / 4,
    iconName: 'tablet',
    category: 'Tablet',
    frameRadius: 0.05,
    isPhone: false,
    isLandscape: false,
  },
];

export const DEFAULT_RATIO_ID = '16-9';

export function getRatioById(id: string): AspectRatioOption | undefined {
  return ASPECT_RATIOS.find((r) => r.id === id);
}

/** Group ratios by device icon for the dropdown sections */
export const RATIO_GROUPS: { iconName: DeviceIconName; label: string; ratios: AspectRatioOption[] }[] = [
  {
    iconName: 'monitor',
    label: 'Desktop',
    ratios: ASPECT_RATIOS.filter((r) => r.iconName === 'monitor'),
  },
  {
    iconName: 'smartphone',
    label: 'Phone',
    ratios: ASPECT_RATIOS.filter((r) => r.iconName === 'smartphone'),
  },
  {
    iconName: 'tablet',
    label: 'Tablet',
    ratios: ASPECT_RATIOS.filter((r) => r.iconName === 'tablet'),
  },
];
