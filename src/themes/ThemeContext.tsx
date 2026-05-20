/* ============================================================
 * 🌓 MapWalls — Theme Context
 *
 * Provides theme mode (dark/light) + resolved token object
 * to every component. Persists choice in localStorage.
 * ============================================================ */

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
  useSyncExternalStore,
} from 'react';
import { themes, type ThemeTokens, type ThemeMode } from './tokens';

/* ─── Constants ─────────────────────────────────────────────── */
const STORAGE_KEY = 'mapwalls-theme';
const MEDIA_QUERY = '(prefers-color-scheme: dark)';

/* ─── Context shape ─────────────────────────────────────────── */
interface ThemeContextValue {
  /** Current mode */
  mode: ThemeMode;
  /** Resolved token object for the current mode */
  tokens: ThemeTokens;
  /** Toggle dark ↔ light */
  toggle: () => void;
  /** Set a specific mode */
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* ─── Subscriber helper (no re-renders on unrelated state) ──── */
function getPreferredScheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
}

function getStoredMode(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    /* localStorage unavailable — use system pref */
  }
  return null;
}

/* ─── Subscribe to storage changes (cross-tab sync) ─────────── */
function subscribeToStorage(cb: () => void) {
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
}

/* ─── Provider ──────────────────────────────────────────────── */
interface ThemeProviderProps {
  children: ReactNode;
  /** Optional initial mode for testing / SSR */
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode }: ThemeProviderProps) {
  const mode = useSyncExternalStore(
    subscribeToStorage,
    () => {
      /* Snapshot — re-read on every store change */
      return initialMode ?? getStoredMode() ?? getPreferredScheme();
    },
    () => initialMode ?? 'dark',
  );

  /* Apply `data-theme` attribute + persist */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* noop */
    }
  }, [mode]);

  const toggle = useCallback(() => {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* noop */
    }
    /* Dispatch synthetic storage event so the external store re-syncs */
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: next }));
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* noop */
    }
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: next }));
  }, []);

  const tokens = themes[mode];

  return (
    <ThemeContext.Provider value={{ mode, tokens, toggle, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ─── Hook ──────────────────────────────────────────────────── */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return ctx;
}
