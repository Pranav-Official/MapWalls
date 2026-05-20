/* ============================================================
 * ⌨️ MapWalls — GlassInput
 *
 * Glassmorphic text input with label + error state.
 * ============================================================ */

import { type InputHTMLAttributes, forwardRef } from 'react';
import styles from './GlassInput.module.css';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, hint, className = '', id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = !!error;

    return (
      <div className={`${styles.wrapper} ${className}`}>
        {label && (
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`${styles.input} ${hasError ? styles.errorInput : ''}`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...rest}
        />

        {error && (
          <p id={`${inputId}-error`} className={styles.error} role="alert">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${inputId}-hint`} className={styles.hint}>
            {hint}
          </p>
        )}
      </div>
    );
  },
);

GlassInput.displayName = 'GlassInput';
