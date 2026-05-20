/* ============================================================
 * 📐 MapWalls — Viewport Fit Hook
 *
 * Tracks a container element's dimensions and computes the
 * largest possible rectangle that fits at a given aspect ratio
 * with configurable padding.
 * ============================================================ */

import { useState, useCallback, useRef, useEffect } from 'react';

/* ─── Result ────────────────────────────────────────────────── */
export interface ViewportFitResult {
  /** Computed width of the frame in px */
  width: number;
  /** Computed height of the frame in px */
  height: number;
  /** The container's inner width (before padding) */
  containerWidth: number;
  /** The container's inner height (before padding) */
  containerHeight: number;
}

/* ─── Config ────────────────────────────────────────────────── */
export interface ViewportFitOptions {
  /** Aspect ratio as width/height (e.g., 16/9) */
  aspectRatio: number;
  /** Total horizontal padding inside the container */
  paddingX?: number;
  /** Total vertical padding inside the container */
  paddingY?: number;
}

/* ─── Defaults ──────────────────────────────────────────────── */
const DEFAULTS = {
  paddingX: 48,
  paddingY: 32,
};

/* ─── Hook ──────────────────────────────────────────────────── */
export function useViewportFit(options: ViewportFitOptions): {
  result: ViewportFitResult;
  containerRef: React.RefCallback<HTMLDivElement>;
} {
  const { aspectRatio, paddingX = DEFAULTS.paddingX, paddingY = DEFAULTS.paddingY } = options;

  const [result, setResult] = useState<ViewportFitResult>({
    width: 0,
    height: 0,
    containerWidth: 0,
    containerHeight: 0,
  });

  const elementRef = useRef<HTMLDivElement | null>(null);

  /* ─── Recalculation ────────────────────────────────────────── */
  const recalculate = useCallback(
    (containerWidth: number, containerHeight: number) => {
      const availableW = Math.max(1, containerWidth - paddingX);
      const availableH = Math.max(1, containerHeight - paddingY);

      let width: number;
      let height: number;

      if (aspectRatio >= 1) {
        /* Landscape / square — width-constrained */
        width = Math.min(availableW, availableH * aspectRatio);
        height = width / aspectRatio;
      } else {
        /* Portrait — height-constrained */
        height = Math.min(availableH, availableW / aspectRatio);
        width = height * aspectRatio;
      }

      setResult({ width: Math.round(width), height: Math.round(height), containerWidth, containerHeight });
    },
    [aspectRatio, paddingX, paddingY],
  );

  /* ─── ResizeObserver on the container ──────────────────────── */
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const { inlineSize, blockSize } = entry.contentBoxSize?.[0] ?? entry.contentRect;
      recalculate(inlineSize, blockSize);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [recalculate]);

  /* ─── Recalculate when ratio changes (even before mount) ──── */
  /* The ResizeObserver callback handles this post-mount, but if
     the container hasn't resized we still need to update.       */
  useEffect(() => {
    const el = elementRef.current;
    if (el) {
      const { width, height } = el.getBoundingClientRect();
      recalculate(width, height);
    }
  }, [recalculate]);

  /* ─── Refs callback ────────────────────────────────────────── */
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      elementRef.current = node;
      const { width, height } = node.getBoundingClientRect();
      recalculate(width, height);
    }
  }, [recalculate]);

  return { result, containerRef };
}
