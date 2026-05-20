/* ============================================================
 * 🎛️ MapWalls — Device Selector
 *
 * Bottom navigation bar for choosing device aspect ratios.
 * Horizontally scrollable, shows icon + label, highlights
 * the active selection with a glass pill indicator.
 * ============================================================ */

import { useRef, useEffect } from 'react';
import { ASPECT_RATIOS, type AspectRatioOption } from './AspectRatios';
import styles from './DeviceSelector.module.css';

/* ─── Props ─────────────────────────────────────────────────── */
interface DeviceSelectorProps {
  activeId: string;
  onChange: (option: AspectRatioOption) => void;
}

/* ─── Component ─────────────────────────────────────────────── */
export function DeviceSelector({ activeId, onChange }: DeviceSelectorProps) {
  const activeRef = useRef<HTMLButtonElement>(null);

  /* Auto-scroll the active option into view on change */
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeId]);

  return (
    <nav className={styles.bar} role="tablist" aria-label="Device aspect ratio">
      <div className={styles.track}>
        {ASPECT_RATIOS.map((ratio) => {
          const isActive = ratio.id === activeId;
          return (
            <button
              key={ratio.id}
              ref={isActive ? activeRef : undefined}
              className={`${styles.option} ${isActive ? styles.active : ''}`}
              onClick={() => onChange(ratio)}
              role="tab"
              aria-selected={isActive}
              aria-label={`${ratio.label} — ${ratio.category}`}
              title={`${ratio.category} ${ratio.label}`}
            >
              <span className={styles.icon}>{ratio.icon}</span>
              <span className={styles.label}>{ratio.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Fade edges for scroll hint ── */}
      <div className={styles.fadeLeft} aria-hidden />
      <div className={styles.fadeRight} aria-hidden />
    </nav>
  );
}
