/* ============================================================
 * 🔍 MapWalls — Nominatim Geocoding Hook
 *
 * Lightweight hook that calls OpenStreetMap's Nominatim API
 * to resolve a search query into lat/lng + bounding box.
 * ============================================================ */

import { useState, useCallback, useRef } from 'react';

/* ─── Types ─────────────────────────────────────────────────── */
export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
  boundingBox: [number, number, number, number]; // minLat, maxLat, minLng, maxLng
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
  boundingbox: [string, string, string, string]; // minLat, maxLat, minLng, maxLng
}

/* ─── Hook ──────────────────────────────────────────────────── */
interface UseGeocodeReturn {
  result: GeocodeResult | null;
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
}

export function useGeocode(): UseGeocodeReturn {
  const [result, setResult] = useState<GeocodeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    /* Cancel any in-flight request */
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const trimmed = query.trim();
    if (!trimmed) {
      setResult(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', trimmed);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '1');

      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          /* Nominatim requires a User-Agent identifying your app */
          'User-Agent': 'MapWalls/1.0 (mapwalls.app)',
          'Accept-Language': 'en',
        },
      });

      if (!res.ok) {
        throw new Error(`Nominatim returned ${res.status}`);
      }

      const data: NominatimResponse[] = await res.json();

      if (data.length === 0) {
        setError('Location not found. Try a different search term.');
        setResult(null);
        return;
      }

      const item = data[0];
      setResult({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
        boundingBox: [
          parseFloat(item.boundingbox[0]),
          parseFloat(item.boundingbox[1]),
          parseFloat(item.boundingbox[2]),
          parseFloat(item.boundingbox[3]),
        ],
      });
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError((err as Error).message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, search };
}
