import type { ReactNode } from 'react';
import { todayDisplay } from '../../lib/format';
import type { SiteContent } from '../../lib/types';
import { cx } from '../../lib/utils';
import styles from './TodayCard.module.css';

type TodayCardProps = {
  today: SiteContent['today'];
  /** full: the home page card · preview: the smaller copy beside the dashboard form */
  variant: 'full' | 'preview';
  footer?: ReactNode;
};

/** The Today’s Brew sticker: soup, sammie and what’s by the till. */
export function TodayCard({ today, variant, footer }: TodayCardProps) {
  const shown = todayDisplay(today);
  const soupDescription = today.soup.description.trim();
  const sammieDescription = today.sammie.description.trim();

  return (
    <div className={cx(styles.card, styles[variant])}>
      <dl className={styles.list}>
        <div>
          <dt className={styles.label}>soup of the day</dt>
          <dd className={styles.value}>
            <span className={cx(today.soup.soldOut && styles.struck)}>{shown.soup}</span>
            {today.soup.soldOut && <span className={styles.soldOut}>sold out!</span>}
            {soupDescription && <span className={styles.description}>{soupDescription}</span>}
          </dd>
        </div>
        <div>
          <dt className={styles.label}>sammie of the day</dt>
          <dd className={styles.value}>
            <span className={cx(today.sammie.soldOut && styles.struck)}>{shown.sammie}</span>
            {shown.price && <span className={styles.price}>{shown.price}</span>}
            {today.sammie.soldOut && <span className={styles.soldOut}>sold out!</span>}
            {sammieDescription && <span className={styles.description}>{sammieDescription}</span>}
          </dd>
        </div>
        <div>
          <dt className={styles.label}>by the till</dt>
          <dd className={styles.value}>{shown.till}</dd>
        </div>
      </dl>
      {footer}
    </div>
  );
}
