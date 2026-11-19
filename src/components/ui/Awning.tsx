import { useId, type CSSProperties } from 'react';
import styles from './Awning.module.css';

/** Striped shop awning with a scalloped edge, across the top of every public page. */
export function Awning({ color = 'var(--purple-awning)' }: { color?: string }) {
  const patternId = `awning-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <div aria-hidden="true" style={{ '--awning': color } as CSSProperties}>
      <div className={styles.stripes} />
      <svg width="100%" height="26" className={styles.scallops} focusable="false">
        <defs>
          <pattern id={patternId} width="96" height="26" patternUnits="userSpaceOnUse">
            <path className={styles.awningScallop} d="M1.5 0 V3 A22.5 20 0 0 0 46.5 3 V0" />
            <path className={styles.creamScallop} d="M49.5 0 V3 A22.5 20 0 0 0 94.5 3 V0" />
          </pattern>
        </defs>
        <rect width="100%" height="26" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
