/* ============================================================
 * 🔍 MapWalls — Search Bar
 *
 * Bottom-anchored search input with an arrow submit button.
 * Calls Nominatim geocoding on submit. Shows loading + error states.
 * ============================================================ */

import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import styles from './SearchBar.module.css';

/* ─── Props ─────────────────────────────────────────────────── */
interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  error?: string | null;
}

/* ─── Component ─────────────────────────────────────────────── */
export function SearchBar({ onSearch, loading = false, error }: SearchBarProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSearch(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.bar} onSubmit={handleSubmit}>
        {/* Search icon */}
        <span className={styles.icon}>
          <Search size={16} />
        </span>

        {/* Input */}
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          placeholder="Search a location…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search location"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Submit / loading button */}
        <button
          className={styles.submit}
          type="submit"
          disabled={loading || !value.trim()}
          aria-label="Search"
          title="Search"
        >
          {loading ? <Loader2 size={18} className={styles.spin} /> : <ArrowRight size={18} />}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
