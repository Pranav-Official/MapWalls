/* ============================================================
 * 🌗 MapWalls — Theme Toggle
 *
 * Animated dark/light switcher with a glass-pill design.
 * ============================================================ */

import { useTheme } from '../../themes/ThemeContext';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { mode, toggle } = useTheme();
  const isDark = mode === 'dark';

  return (
    <button
      className={styles.toggle}
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Track */}
      <span className={styles.track}>
        {/* Icons */}
        <span className={styles.icon} aria-hidden>
          ☀️
        </span>
        <span className={styles.icon} aria-hidden>
          🌙
        </span>

        {/* Glowing thumb */}
        <span
          className={styles.thumb}
          style={{
            transform: isDark ? 'translateX(0)' : 'translateX(32px)',
          }}
        >
          {isDark ? '🌙' : '☀️'}
        </span>
      </span>
    </button>
  );
}
