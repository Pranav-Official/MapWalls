/* ============================================================
 * 🃏 MapWalls — GlassCard
 *
 * A glassmorphic card component. Themed via CSS custom props.
 * ============================================================ */

import { type ReactNode, type CSSProperties } from 'react';
import { type GlassProps, glassStyles } from '../../themes/glass';
import styles from './GlassCard.module.css';

interface GlassCardProps extends GlassProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** If true, renders as <section> instead of <div> */
  as?: 'div' | 'section' | 'article' | 'aside';
  onClick?: () => void;
  /** Padding override */
  p?: string;
}

export function GlassCard({
  children,
  className = '',
  style,
  level,
  borderless,
  transparent,
  as: Tag = 'div',
  onClick,
  p,
}: GlassCardProps) {
  const glassStyle = glassStyles({ level, borderless, transparent });

  return (
    <Tag
      className={`${styles.card} ${className}`}
      style={{
        ...glassStyle,
        padding: p ?? 'var(--space-6)',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}
