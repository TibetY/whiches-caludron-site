import { useNow } from '../../hooks/useNow';
import { getPublicDoorStatus } from '../../lib/hours';
import { cx } from '../../lib/utils';
import { usePublished } from '../../store/context';
import styles from './DoorSign.module.css';

/** The hanging OPEN / CLOSED sign in the “Come find the cauldron” section. */
export function DoorSign() {
  const { hours, today } = usePublished();
  const now = useNow();
  const status = getPublicDoorStatus(now, hours.week, hours.specials, today.doorOverride);

  return (
    <div className={styles.wrap}>
      <svg aria-hidden="true" focusable="false" viewBox="0 0 290 64" className={styles.string}>
        <path d="M145 10 L36 62 M145 10 L254 62" fill="none" stroke="#26121F" strokeWidth="3" />
        <circle cx="145" cy="9" r="7" fill="#ACA7A1" stroke="#26121F" strokeWidth="3" />
      </svg>
      <div className={styles.sign}>
        <div className={styles.lead}>{status.open ? 'Come on in, we’re' : 'Sorry, we’re'}</div>
        <div className={cx(styles.word, status.open ? styles.open : styles.closed)}>
          {status.open ? 'OPEN' : 'CLOSED'}
        </div>
        <div className={styles.note}>{status.note}</div>
      </div>
    </div>
  );
}
