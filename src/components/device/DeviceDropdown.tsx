/* ============================================================
 * 🎛️ MapWalls — Device Dropdown
 *
 * Glassmorphic dropdown to select device aspect ratio.
 * Groups options by device icon (monitor / smartphone / tablet).
 * ============================================================ */

import { useState, useRef, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, ChevronDown } from 'lucide-react';
import { RATIO_GROUPS, type AspectRatioOption } from './AspectRatios';
import styles from './DeviceDropdown.module.css';

/* ─── Icon map ──────────────────────────────────────────────── */
const ICON_MAP = {
  monitor: Monitor,
  smartphone: Smartphone,
  tablet: Tablet,
} as const;

/* ─── Props ─────────────────────────────────────────────────── */
interface DeviceDropdownProps {
  activeId: string;
  onChange: (ratio: AspectRatioOption) => void;
}

/* ─── Component ─────────────────────────────────────────────── */
export function DeviceDropdown({ activeId, onChange }: DeviceDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeOption = RATIO_GROUPS.flatMap((g) => g.ratios).find(
    (r) => r.id === activeId,
  );

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  if (!activeOption) return null;

  const ActiveIcon = ICON_MAP[activeOption.iconName];

  return (
    <div ref={ref} className={styles.wrapper}>
      {/* ── Trigger button ── */}
      <button
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select device aspect ratio"
      >
        <span className={styles.triggerIcon}>
          <ActiveIcon size={16} />
        </span>
        <span className={styles.triggerLabel}>{activeOption.label}</span>
        <ChevronDown
          size={14}
          className={`${styles.chevron} ${open ? styles.chevronUp : ''}`}
        />
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className={styles.panel} role="listbox" aria-label="Device ratios">
          {RATIO_GROUPS.map((group) => {
            const GroupIcon = ICON_MAP[group.iconName];
            return (
              <div key={group.iconName} className={styles.group}>
                <span className={styles.groupLabel}>
                  <GroupIcon size={12} />
                  {group.label}
                </span>
                {group.ratios.map((ratio) => {
                  const isActive = ratio.id === activeId;
                  const RatioIcon = ICON_MAP[ratio.iconName];
                  return (
                    <button
                      key={ratio.id}
                      className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
                      onClick={() => {
                        onChange(ratio);
                        setOpen(false);
                      }}
                      role="option"
                      aria-selected={isActive}
                    >
                      <RatioIcon size={14} />
                      <span className={styles.itemLabel}>{ratio.label}</span>
                      <span className={styles.itemCategory}>{ratio.category}</span>
                      {isActive && <span className={styles.check} />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
