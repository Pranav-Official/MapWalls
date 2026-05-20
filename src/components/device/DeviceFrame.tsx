/* ============================================================
 * 📱 MapWalls — Device Frame
 *
 * A responsive device bezel that wraps children and smoothly
 * animates between aspect ratios. Automatically fits the
 * viewport with relaxed padding.
 * ============================================================ */

import { type ReactNode } from 'react';
import { type AspectRatioOption } from './AspectRatios';
import { useViewportFit } from './useViewportFit';
import styles from './DeviceFrame.module.css';

/* ─── Props ─────────────────────────────────────────────────── */
interface DeviceFrameProps {
  children: ReactNode;
  ratio: AspectRatioOption;
}

/* ─── Notch sizes mapped by ratio id ────────────────────────── */
const NOTCH_WIDTH: Record<string, number> = {
  '9-16': 160,
  '9-21': 140,
  '2-3': 150,
};
const NOTCH_HEIGHT = 28;
const NOTCH_RADIUS = 14;

/* ─── Component ─────────────────────────────────────────────── */
export function DeviceFrame({ children, ratio }: DeviceFrameProps) {
  const { result, containerRef } = useViewportFit({
    aspectRatio: ratio.ratio,
    paddingX: 48,
    paddingY: 24,
  });

  const { width, height } = result;
  const showNotch = ratio.isPhone;
  const notchW = showNotch ? (NOTCH_WIDTH[ratio.id] ?? 160) : 0;
  const bezelRadius = Math.min(ratio.frameRadius * Math.min(width, height), 48);
  const contentRadius = Math.max(bezelRadius - 3, 0);

  return (
    <div ref={containerRef} className={styles.stage}>
      {width > 0 && height > 0 && (
        <div
          className={styles.device}
          style={{
            width,
            height,
            borderRadius: bezelRadius,
          }}
        >
          {/* ── Device bezel inner glow (subtle edge light) ── */}
          <div
            className={styles.bezelEdge}
            style={{ borderRadius: bezelRadius }}
          />

          {/* ── Content area ── */}
          <div
            className={styles.content}
            style={{ borderRadius: contentRadius }}
          >
            {children}
          </div>

          {/* ── Notch / Dynamic Island ── */}
          {showNotch && (
            <div
              className={styles.notch}
              style={{
                width: notchW,
                height: NOTCH_HEIGHT,
                borderRadius: NOTCH_RADIUS,
              }}
            >
              {/* Camera dot */}
              <span className={styles.cameraDot} />
            </div>
          )}

          {/* ── Home indicator (phone only) ── */}
          {showNotch && (
            <div className={styles.homeIndicator}>
              <span className={styles.homeBar} />
            </div>
          )}

          {/* ── Ratio label (bottom-right corner of bezel) ── */}
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>{ratio.iconName}</span>
            <span>{ratio.label}</span>
          </div>
        </div>
      )}
    </div>
  );
}
