import type { ReactNode } from 'react';
import { cx } from '../../lib/utils';
import styles from './Switch.module.css';

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Visible text next to the track, e.g. “Sold out” or “Showing”. */
  label: ReactNode;
  /** Accessible name when the visible text alone isn't enough. */
  ariaLabel?: string;
  className?: string;
};

/** On/off toggle (role="switch"). */
export function Switch({ checked, onChange, label, ariaLabel, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={cx(styles.switch, className)}
      onClick={() => onChange(!checked)}
    >
      <span aria-hidden="true" className={styles.track}>
        <span className={styles.knob} />
      </span>
      {label}
    </button>
  );
}
