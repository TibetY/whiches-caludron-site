import type { HTMLAttributes } from 'react';
import { cx } from '../../lib/utils';
import styles from './StickerCard.module.css';

type StickerCardProps = HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'article' | 'figure' | 'section';
  tone?: 'white' | 'aqua' | 'orchid' | 'lime' | 'cream' | 'yellow';
  /** `deep` is for stickers on the purple swirl bands. */
  shadow?: 'soft' | 'deep';
};

/**
 * White die-cut sticker: ink outline, white margin and a soft drop.
 * Tilt and radius come from --tilt and --radius on the passed class.
 */
export function StickerCard({
  as: Tag = 'div',
  tone = 'white',
  shadow = 'soft',
  className,
  ...rest
}: StickerCardProps) {
  return <Tag className={cx(styles.sticker, styles[tone], styles[shadow], className)} {...rest} />;
}
