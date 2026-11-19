import { forwardRef, type ReactNode } from 'react';
import { cx } from '../../lib/utils';
import { Icon, type IconName } from '../icons/Icon';
import styles from './DashCard.module.css';

type DashCardProps = {
  titleId: string;
  title: ReactNode;
  /** Shorter title for phones (“Soup” instead of “Soup of the day”). */
  phoneTitle?: ReactNode;
  icon?: IconName;
  /** Control at the end of the title row, such as a switch. */
  aside?: ReactNode;
  tone?: 'white' | 'cream' | 'wash';
  as?: 'section' | 'aside';
  /** Small line above the title, e.g. “Editing”. */
  kicker?: ReactNode;
  /** Help text under the title (kept beside the title when there is an aside). */
  description?: ReactNode;
  className?: string;
  titleClassName?: string;
  children?: ReactNode;
};

/** White dashboard card: 3px ink border, 20px corners, solid drop. Dashboard cards don't tilt. */
export const DashCard = forwardRef<HTMLElement, DashCardProps>(function DashCard(
  {
    titleId,
    title,
    phoneTitle,
    icon,
    aside,
    tone = 'white',
    as: Tag = 'section',
    kicker,
    description,
    className,
    titleClassName,
    children,
  },
  ref,
) {
  const heading = (
    <h2 id={titleId} className={cx(styles.title, titleClassName)} tabIndex={-1}>
      {icon && <Icon name={icon} strokeWidth={2.4} color="#9E4C92" className={styles.titleIcon} />}
      {phoneTitle ? (
        <>
          <span className={styles.wide}>{title}</span>
          <span className={styles.phone}>{phoneTitle}</span>
        </>
      ) : (
        title
      )}
    </h2>
  );

  const intro = description ? (
    <div>
      {heading}
      <p className={styles.description}>{description}</p>
    </div>
  ) : (
    heading
  );

  return (
    <Tag ref={ref} aria-labelledby={titleId} className={cx(styles.card, styles[tone], className)}>
      {kicker && <p className={styles.kicker}>{kicker}</p>}
      {aside ? (
        <div className={styles.head}>
          {intro}
          {aside}
        </div>
      ) : (
        intro
      )}
      {children}
    </Tag>
  );
});
