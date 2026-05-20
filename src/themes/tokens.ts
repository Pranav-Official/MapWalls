/* ============================================================
 * 🎨 MapWalls — Design Tokens
 *
 * Single source of truth for every visual property.
 * Light & Dark themes share the same token shape.
 * ============================================================ */

export type ThemeMode = 'light' | 'dark';

/* ─── Colour palette ────────────────────────────────────────── */
const palette = {
  white: '#ffffff',
  black: '#000000',

  /* Neutrals */
  neutral: {
    50: '#f8f9fa',
    100: '#f1f3f5',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#868e96',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
    950: '#0d0f12',
  },

  /* Indigo accent — works well on glass in both modes */
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },

  /* Status */
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

/* ─── Spacing scale (4 px base) ─────────────────────────────── */
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
} as const;

/* ─── Border radius ─────────────────────────────────────────── */
export const radii = {
  none: '0px',
  sm: '6px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

/* ─── Font ──────────────────────────────────────────────────── */
export const fonts = {
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
} as const;

/* ─── Shadows ───────────────────────────────────────────────── */
export const shadows = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
  md: '0 4px 12px rgba(0, 0, 0, 0.1)',
  lg: '0 8px 30px rgba(0, 0, 0, 0.12)',
  xl: '0 20px 60px rgba(0, 0, 0, 0.15)',
  glow: '0 0 20px rgba(99, 102, 241, 0.25)',
} as const;

/* ─── Glassmorphism presets ─────────────────────────────────── */
export const glassPresets = {
  subtle: {
    dark: {
      background: 'rgba(255, 255, 255, 0.04)',
      border: 'rgba(255, 255, 255, 0.06)',
      blur: '12px',
    },
    light: {
      background: 'rgba(255, 255, 255, 0.5)',
      border: 'rgba(255, 255, 255, 0.6)',
      blur: '12px',
    },
  },
  elevated: {
    dark: {
      background: 'rgba(255, 255, 255, 0.08)',
      border: 'rgba(255, 255, 255, 0.1)',
      blur: '20px',
    },
    light: {
      background: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.8)',
      blur: '24px',
    },
  },
  heavy: {
    dark: {
      background: 'rgba(255, 255, 255, 0.12)',
      border: 'rgba(255, 255, 255, 0.15)',
      blur: '30px',
    },
    light: {
      background: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(255, 255, 255, 0.9)',
      blur: '30px',
    },
  },
} as const;

/* ─── Theme token shape ─────────────────────────────────────── */
export interface ThemeTokens {
  mode: ThemeMode;

  /* Surfaces */
  bg: {
    page: string;
    elevated: string;
    card: string;
    overlay: string;
  };

  /* Text */
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };

  /* Accent */
  accent: string;
  accentHover: string;
  accentMuted: string;

  /* Glass presets (resolved for current mode) */
  glass: {
    subtle: { background: string; border: string; blur: string };
    elevated: { background: string; border: string; blur: string };
    heavy: { background: string; border: string; blur: string };
  };

  /* Interactive states */
  interactive: {
    hover: string;
    active: string;
    disabled: string;
  };

  /* Borders & dividers */
  border: {
    subtle: string;
    default: string;
    strong: string;
  };

  /* Shadows (resolved) */
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    glow: string;
  };

  /* Semantic */
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };

  /* Misc */
  scrollbar: string;
  selection: string;
}

/* ─── Dark theme ────────────────────────────────────────────── */
const dark: ThemeTokens = {
  mode: 'dark',

  bg: {
    page: palette.neutral[950],
    elevated: palette.neutral[900],
    card: 'rgba(255, 255, 255, 0.04)',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },

  text: {
    primary: palette.neutral[100],
    secondary: palette.neutral[400],
    muted: palette.neutral[600],
    inverse: palette.neutral[950],
  },

  accent: palette.indigo[400],
  accentHover: palette.indigo[300],
  accentMuted: 'rgba(129, 140, 248, 0.15)',

  glass: {
    subtle: { ...glassPresets.subtle.dark },
    elevated: { ...glassPresets.elevated.dark },
    heavy: { ...glassPresets.heavy.dark },
  },

  interactive: {
    hover: 'rgba(255, 255, 255, 0.06)',
    active: 'rgba(255, 255, 255, 0.1)',
    disabled: 'rgba(255, 255, 255, 0.03)',
  },

  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    default: 'rgba(255, 255, 255, 0.1)',
    strong: 'rgba(255, 255, 255, 0.16)',
  },

  shadow: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 30px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 60px rgba(0, 0, 0, 0.6)',
    glow: '0 0 24px rgba(129, 140, 248, 0.3)',
  },

  semantic: {
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,
  },

  scrollbar: palette.neutral[800],
  selection: 'rgba(129, 140, 248, 0.3)',
};

/* ─── Light theme ───────────────────────────────────────────── */
const light: ThemeTokens = {
  mode: 'light',

  bg: {
    page: palette.neutral[100],
    elevated: palette.white,
    card: 'rgba(255, 255, 255, 0.5)',
    overlay: 'rgba(0, 0, 0, 0.3)',
  },

  text: {
    primary: palette.neutral[900],
    secondary: palette.neutral[600],
    muted: palette.neutral[400],
    inverse: palette.white,
  },

  accent: palette.indigo[600],
  accentHover: palette.indigo[500],
  accentMuted: 'rgba(99, 102, 241, 0.1)',

  glass: {
    subtle: { ...glassPresets.subtle.light },
    elevated: { ...glassPresets.elevated.light },
    heavy: { ...glassPresets.heavy.light },
  },

  interactive: {
    hover: 'rgba(0, 0, 0, 0.04)',
    active: 'rgba(0, 0, 0, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.02)',
  },

  border: {
    subtle: 'rgba(0, 0, 0, 0.06)',
    default: 'rgba(0, 0, 0, 0.1)',
    strong: 'rgba(0, 0, 0, 0.18)',
  },

  shadow: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.06)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 30px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 60px rgba(0, 0, 0, 0.12)',
    glow: '0 0 20px rgba(99, 102, 241, 0.2)',
  },

  semantic: {
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,
  },

  scrollbar: palette.neutral[300],
  selection: 'rgba(99, 102, 241, 0.2)',
};

/* ─── Exported theme map ────────────────────────────────────── */
export const themes: Record<ThemeMode, ThemeTokens> = { dark, light };
