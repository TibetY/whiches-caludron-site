import type { CSSProperties } from 'react';
import WaveAbove from '@assets/svg/wave-cream-above.svg?react';
import WaveBelow from '@assets/svg/wave-cream-below.svg?react';
import { cx } from '../../lib/utils';
import styles from './WaveDivider.module.css';

type WaveDividerProps = {
  /** top: joins the section above · bottom: joins the section below */
  position: 'top' | 'bottom';
  /** Colour of the neighbouring section the wave melts into. */
  fill?: string;
};

/** 60px wave with an ink line, joining a coloured band to its neighbour. */
export function WaveDivider({ position, fill = 'var(--cream)' }: WaveDividerProps) {
  const Svg = position === 'top' ? WaveAbove : WaveBelow;
  return (
    <Svg
      aria-hidden="true"
      focusable="false"
      className={cx(styles.wave, styles[position])}
      style={{ '--wave-fill': fill } as CSSProperties}
    />
  );
}
