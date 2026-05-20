/* ============================================================
 * 🔘 MapWalls — GlassButton
 *
 * Glassmorphic button with accent hover effects.
 * Variants: primary | secondary | ghost
 * ============================================================ */

import { type ReactNode, type ButtonHTMLAttributes } from 'react';
import styles from './GlassButton.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Full width */
  block?: boolean;
}

export function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  className = '',
  disabled,
  ...rest
}: GlassButtonProps) {
  const cls = [
    styles.btn,
    styles[variant],
    styles[size],
    block ? styles.block : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {loading && <span className={styles.spinner} aria-hidden />}
      <span className={loading ? styles.labelHidden : ''}>{children}</span>
    </button>
  );
}
