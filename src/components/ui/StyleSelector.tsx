/* ============================================================
 * 🎨 MapWalls — Style Selector
 *
 * Glassmorphic dropdown that shows each map style's name and
 * a live palette swatch. Follows the same pattern as DeviceDropdown.
 * ============================================================ */

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Palette, ChevronDown, Check } from 'lucide-react'
import { MAP_STYLES, getStyleById, type MapStyleDef } from '../../styles/mapStyles'
import styles from './StyleSelector.module.css'

/* ─── Props ─────────────────────────────────────────────────── */
interface StyleSelectorProps {
  activeId: string
  onChange: (style: MapStyleDef) => void
}

/* ─── Component ─────────────────────────────────────────────── */
export function StyleSelector({ activeId, onChange }: StyleSelectorProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [coords, setCoords] = useState({ left: 0, bottom: 0 })
  const activeStyle = getStyleById(activeId)

  const updateCoords = useCallback(() => {
    const btn = triggerRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setCoords({ left: rect.left, bottom: window.innerHeight - rect.top + 8 })
  }, [])

  const handleToggle = () => {
    setOpen((o) => {
      if (!o) updateCoords()
      return !o
    })
  }

  /* Close on outside click */
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        !(target instanceof Element && target.closest('[data-dropdown-panel]'))
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  /* Close on Escape */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  /* Recalculate on resize/scroll while open */
  useEffect(() => {
    if (!open) return
    window.addEventListener('resize', updateCoords)
    window.addEventListener('scroll', updateCoords, true)
    return () => {
      window.removeEventListener('resize', updateCoords)
      window.removeEventListener('scroll', updateCoords, true)
    }
  }, [open, updateCoords])

  if (!activeStyle) return null

  const panel = (
    <div
      className={styles.panel}
      role="listbox"
      aria-label="Map styles"
      data-dropdown-panel
      style={{
        position: 'fixed',
        left: coords.left,
        bottom: coords.bottom,
      }}
    >
      {/* Group headers — iterate categories in order */}
      {(['Dark', 'Light', 'Vibrant'] as const).map((category) => {
        const items = MAP_STYLES.filter((s) => s.category === category)
        if (!items.length) return null
        return (
          <div key={category} className={styles.group}>
            <span className={styles.groupLabel}>{category}</span>
            {items.map((style) => {
              const isActive = style.id === activeId
              return (
                <button
                  key={style.id}
                  className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
                  onClick={() => {
                    onChange(style)
                    setOpen(false)
                  }}
                  role="option"
                  aria-selected={isActive}
                >
                  <span className={styles.itemIcon}>{style.icon}</span>

                  {/* Palette swatch strip */}
                  <span className={styles.itemSwatch} aria-hidden>
                    {style.palette.map((c, i) => (
                      <span
                        key={i}
                        className={styles.swatchBar}
                        style={{
                          background: c,
                          width: `${100 / style.palette.length}%`,
                        }}
                      />
                    ))}
                  </span>

                  <span className={styles.itemLabel}>{style.name}</span>
                  {isActive && <Check size={14} className={styles.check} />}
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {/* ── Trigger button ── */}
      <button
        ref={triggerRef}
        className={styles.trigger}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select map style"
      >
        <Palette size={16} className={styles.triggerIcon} />
        <span className={styles.triggerLabel}>{activeStyle.name}</span>
        <span className={styles.triggerSwatch} aria-hidden>
          {activeStyle.palette.map((c) => (
            <span
              key={c}
              className={styles.swatchDot}
              style={{ background: c }}
            />
          ))}
        </span>
        <ChevronDown
          size={14}
          className={`${styles.chevron} ${open ? styles.chevronUp : ''}`}
        />
      </button>

      {/* ── Dropdown panel (portaled to body) ── */}
      {open && createPortal(panel, document.body)}
    </div>
  )
}
