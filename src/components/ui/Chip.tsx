import type { ButtonHTMLAttributes } from 'react';
import { cx } from '../../lib/utils';
import styles from './Chip.module.css';

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pressed: boolean;
  /** Fill when pressed: aqua (picks, labels), lime (treats) or purple (filters). */
  tone?: 'aqua' | 'lime' | 'purple';
};

/** Pill toggle button (aria-pressed). */
export function Chip({
  pressed,
  tone = 'aqua',
  className,
  children,
  type = 'button',
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      className={cx(styles.chip, styles[tone], className)}
      {...rest}
    >
      {children}
    </button>
  );
}
