/* ============================================================
 * ⬇️ MapWalls — Download Button
 *
 * Glassmorphic download button in the toolbar. Clicking opens
 * a resolution picker (QHD / 4K / 8K). Renders tiles at native
 * 256×256, crops to viewport, scales smoothly to target.
 * ============================================================ */

import { useState, useRef, useEffect } from 'react'
import { Download, Loader2 } from 'lucide-react'
import type { MapStyleDef } from '../../styles/mapStyles'
import type { Map as LeafletMap } from 'leaflet'
import {
  RESOLUTIONS,
  computeTargetSize,
  captureMapViewport,
  type ResolutionPreset,
} from '../map/mapCapture'
import styles from './DownloadButton.module.css'

/* ─── Props ─────────────────────────────────────────────────── */
interface DownloadButtonProps {
  mapRef: React.RefObject<LeafletMap | null>
  style: MapStyleDef
}

/* ─── Component ─────────────────────────────────────────────── */
export function DownloadButton({ mapRef, style }: DownloadButtonProps) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [progress, setProgress] = useState({ loaded: 0, total: 0 })
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const handleDownload = async (preset: ResolutionPreset) => {
    const map = mapRef.current
    if (!map) return

    setBusy(preset.label)
    setOpen(false)
    setProgress({ loaded: 0, total: 0 })

    try {
      const { x: vw, y: vh } = map.getSize()
      const [tw, th] = computeTargetSize(vw, vh, preset)

      const { blob, width, height } = await captureMapViewport(
        map,
        tw,
        th,
        style,
        (loaded, total) => setProgress({ loaded, total }),
      )

      const filename =
        `mapwalls-${style.name.replace(/\s+/g, '-').toLowerCase()}-${width}x${height}.png`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Map capture failed', err)
    } finally {
      setBusy(null)
      setProgress({ loaded: 0, total: 0 })
    }
  }

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button
        className={styles.trigger}
        onClick={() => !busy && setOpen((o) => !o)}
        disabled={!!busy}
        aria-label="Download map"
        title="Download map image"
      >
        {busy ? (
          <Loader2 size={16} className={styles.spin} />
        ) : (
          <Download size={16} />
        )}
      </button>

      {open && !busy && (
        <div className={styles.panel} role="listbox" aria-label="Resolution">
          {RESOLUTIONS.map((preset) => {
            const map = mapRef.current
            let detail = ''
            if (map) {
              const { x: vw, y: vh } = map.getSize()
              const [tw, th] = computeTargetSize(vw, vh, preset)
              detail = `${tw}×${th}`
            }
            return (
              <button
                key={preset.label}
                className={styles.item}
                onClick={() => handleDownload(preset)}
                role="option"
              >
                <span className={styles.itemLabel}>{preset.label}</span>
                <span className={styles.itemDetail}>{detail}</span>
              </button>
            )
          })}
        </div>
      )}

      {busy && progress.total > 0 && (
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${Math.round((progress.loaded / progress.total) * 100)}%`,
              }}
            />
          </div>
          <span className={styles.progressText}>
            {busy} · {progress.loaded}/{progress.total}
          </span>
        </div>
      )}
    </div>
  )
}
