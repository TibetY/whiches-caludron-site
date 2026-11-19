import { cx } from '../../lib/utils';
import styles from './CartoonButton.module.css';

export type CartoonVariant = 'primary' | 'secondary' | 'tertiary';
/** sm/md: dashboard sizes · lg/xl: website sizes */
export type CartoonSize = 'sm' | 'md' | 'lg' | 'xl';

/** Class names for the chunky cartoon button. Also used on file-upload labels. */
export function cartoonClass(
  variant: CartoonVariant = 'primary',
  size: CartoonSize = 'md',
  ...extra: Array<string | false | null | undefined>
): string {
  return cx(styles.button, styles[variant], styles[size], ...extra);
}
