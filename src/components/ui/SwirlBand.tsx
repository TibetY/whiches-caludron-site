import SwirlDeep from '@assets/svg/swirl-band.svg?react';
import SwirlLight from '@assets/svg/swirl-band-light.svg?react';
import { cx } from '../../lib/utils';
import styles from './SwirlBand.module.css';

type SwirlBandProps = {
  /** deep: purple bands (hero, sticker wall, footer) · light: the lavender menu page */
  tone?: 'deep' | 'light';
  /** Mirror horizontally for variety. */
  mirror?: boolean;
};

/** Purple swirl background, like the logo sticker's. Fills its positioned parent. */
export function SwirlBand({ tone = 'deep', mirror = false }: SwirlBandProps) {
  const Svg = tone === 'deep' ? SwirlDeep : SwirlLight;
  return (
    <Svg
      aria-hidden="true"
      focusable="false"
      className={cx(styles.swirl, mirror && styles.mirror)}
    />
  );
}
