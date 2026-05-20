/* ============================================================
 * 🪟 MapWalls — Glassmorphism Helpers
 *
 * Programmatic CSS-in-JS helpers for glass surfaces.
 * Use these when you need dynamic glass styles in React.
 * For static glass, use the .glass-subtle/.glass-elevated/.glass-heavy
 * CSS classes from global.css.
 * ============================================================ */

import type { CSSProperties } from 'react';

/* ─── Glass preset levels ───────────────────────────────────── */
export type GlassLevel = 'subtle' | 'elevated' | 'heavy';

/* ─── Glass style factory ───────────────────────────────────── */
export interface GlassOptions {
  level?: GlassLevel;
  borderRadius?: string;
  /** Extra custom styles merged in */
  sx?: CSSProperties;
}

/**
 * Generate CSSProperties for a glassmorphic surface.
 *
 * @example
 * ```tsx
 * <div style={glass({ level: 'elevated', borderRadius: '16px' })}>
 *   Content
 * </div>
 * ```
 */
export function glass(options: GlassOptions = {}): CSSProperties {
  const { level = 'subtle', borderRadius = 'var(--radius-lg)', sx } = options;

  const levelVars: Record<GlassLevel, string> = {
    subtle: 'subtle',
    elevated: 'elevated',
    heavy: 'heavy',
  };

  return {
    background: `var(--glass-${levelVars[level]}-bg)`,
    backdropFilter: `blur(var(--glass-${levelVars[level]}-blur))`,
    WebkitBackdropFilter: `blur(var(--glass-${levelVars[level]}-blur))`,
    border: `1px solid var(--glass-${levelVars[level]}-border)`,
    borderRadius,
    ...sx,
  };
}

/* ─── Glass surface component helpers ───────────────────────── */

/** Props shared by all glass components */
export interface GlassProps {
  level?: GlassLevel;
  /** Shorthand — no border */
  borderless?: boolean;
  /** Shorthand — no background / fully transparent */
  transparent?: boolean;
}

/**
 * Compute the full style set for a glass element
 * from component-level props.
 */
export function glassStyles(
  props: GlassProps & { borderRadius?: string },
): CSSProperties {
  const { level = 'subtle', borderless, transparent, borderRadius = 'var(--radius-lg)' } = props;
  const lvl = level;

  return {
    background: transparent
      ? 'transparent'
      : `var(--glass-${lvl}-bg)`,
    backdropFilter: transparent
      ? 'none'
      : `blur(var(--glass-${lvl}-blur))`,
    WebkitBackdropFilter: transparent
      ? 'none'
      : `blur(var(--glass-${lvl}-blur))`,
    border: borderless || transparent
      ? 'none'
      : `1px solid var(--glass-${lvl}-border)`,
    borderRadius,
  };
}

/* ─── Theme-aware transition string ─────────────────────────── */
export const themeTransition = 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease';
