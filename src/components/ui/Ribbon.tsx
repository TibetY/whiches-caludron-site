import type { ReactNode } from 'react';
import { cx } from '../../lib/utils';
import styles from './Ribbon.module.css';

type RibbonProps = {
  children: ReactNode;
  /**
   * Position and size the tails with CSS variables on this class:
   * --tail-w (width), --tail-x (how far they stick out, negative), --tail-y (how far they drop),
   * --tilt (rotation).
   */
  className?: string;
  bandClassName?: string;
  bandAs?: 'div' | 'p';
};

/** Aqua ribbon banner with notched teal tails tucked behind each end. */
export function Ribbon({ children, className, bandClassName, bandAs: Band = 'div' }: RibbonProps) {
  return (
    <div className={cx(styles.ribbon, className)}>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 70 60"
        preserveAspectRatio="none"
        className={cx(styles.tail, styles.left)}
      >
        <path d="M70 1.5 L3 1.5 L20 30 L3 58.5 L70 58.5 Z" />
      </svg>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 70 60"
        preserveAspectRatio="none"
        className={cx(styles.tail, styles.right)}
      >
        <path d="M0 1.5 L67 1.5 L50 30 L67 58.5 L0 58.5 Z" />
      </svg>
      <Band className={cx(styles.band, bandClassName)}>{children}</Band>
    </div>
  );
}
