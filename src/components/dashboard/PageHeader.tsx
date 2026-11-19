import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '../../lib/utils';
import { Icon } from '../icons/Icon';
import { CartoonButton, OutlinedHeading } from '../ui';
import { useDashboard } from './context';
import styles from './PageHeader.module.css';
import { StatusPill } from './StatusPill';

type PageHeaderProps = {
  title: string;
  description: ReactNode;
  greeting?: string;
  /** Extra buttons next to Publish, e.g. “Preview menu page”. */
  actions?: ReactNode;
  /** The phone artboard skips the description on Today’s brew. */
  hideDescriptionOnPhone?: boolean;
};

/**
 * Page title, live status and Publish. On phones the title and status move to the top bar
 * and Publish to the sticky bottom bar, so only the description (and extra actions) stay.
 */
export function PageHeader({
  title,
  description,
  greeting,
  actions,
  hideDescriptionOnPhone = false,
}: PageHeaderProps) {
  const { publish, toastVisible, toastText, toastHref } = useDashboard();
  const emptyOnPhone = hideDescriptionOnPhone && !actions;

  return (
    <>
      <div className={cx(styles.header, emptyOnPhone && styles.collapseOnPhone)}>
        {greeting && <p className={styles.greeting}>{greeting}</p>}
        <div className={styles.row}>
          <div className={styles.titles}>
            <OutlinedHeading as="h1" className={styles.title}>
              {title}
            </OutlinedHeading>
            <p className={cx(styles.description, hideDescriptionOnPhone && styles.hideOnPhone)}>
              {description}
            </p>
          </div>
          <div className={styles.actions}>
            <StatusPill className={styles.wideOnly} />
            {actions}
            <CartoonButton className={styles.wideOnly} onClick={publish}>
              Publish changes
            </CartoonButton>
          </div>
        </div>
      </div>
      {toastVisible && (
        <div role="status" className={styles.toast}>
          <Icon name="check" strokeWidth={3} color="#26121F" className={styles.toastIcon} />
          <span className={styles.wideText}>{toastText}</span>
          <span className={styles.phoneText}>Published! It’s live on the website.</span>
          <Link to={toastHref} className={styles.toastLink}>
            See it on the website
          </Link>
        </div>
      )}
    </>
  );
}
