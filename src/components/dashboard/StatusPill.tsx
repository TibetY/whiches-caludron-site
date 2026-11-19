import { cx } from '../../lib/utils';
import { useStore } from '../../store/context';
import styles from './StatusPill.module.css';

/** “Changes not published yet” while the draft differs from the website, else “Live on the website”. */
export function StatusPill({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const { isDirty } = useStore();
  return (
    <span
      role="status"
      className={cx(styles.pill, isDirty && styles.dirty, compact && styles.compact, className)}
    >
      <span aria-hidden="true" className={styles.dot} />
      {isDirty ? 'Changes not published yet' : 'Live on the website'}
    </span>
  );
}
