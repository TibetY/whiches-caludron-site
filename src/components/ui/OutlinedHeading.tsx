import type { HTMLAttributes } from 'react';
import { cx } from '../../lib/utils';
import styles from './OutlinedHeading.module.css';

type OutlinedHeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span';
  /** Outline weight: 1 = dashboard brand, 2 = headings, 3 = hero and big titles. */
  outline?: 1 | 2 | 3;
  tone?: 'purple' | 'cream' | 'aqua' | 'inherit';
};

/** Bubbly Chewy lettering with a dark cartoon outline and drop, like the logo. */
export function OutlinedHeading({
  as: Tag = 'h2',
  outline = 2,
  tone = 'purple',
  className,
  ...rest
}: OutlinedHeadingProps) {
  return (
    <Tag
      className={cx(
        styles.heading,
        styles[`o${outline}`],
        tone !== 'inherit' && styles[tone],
        className,
      )}
      {...rest}
    />
  );
}
