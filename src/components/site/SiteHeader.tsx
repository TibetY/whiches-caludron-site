import { Link } from 'react-router-dom';
import { telHref } from '../../lib/format';
import { usePublished } from '../../store/context';
import { PhoneGlyph } from './decorations';
import styles from './SiteHeader.module.css';

export function SiteHeader({ page }: { page: 'home' | 'menu' | 'other' }) {
  const { contact } = usePublished();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.wordmark}>
          ’wiches cauldron
        </Link>
        <nav aria-label="Main" className={styles.nav}>
          {page === 'home' ? (
            <>
              <Link to="/menu" className={styles.link}>
                The menu
              </Link>
              <a href="#today" className={styles.link}>
                Today’s brew
              </a>
              <a href="#story" className={styles.link}>
                Our story
              </a>
              <a href="#visit" className={styles.link}>
                Visit us
              </a>
            </>
          ) : (
            <>
              <Link to="/" className={styles.link}>
                Home
              </Link>
              <Link
                to="/menu"
                aria-current={page === 'menu' ? 'page' : undefined}
                className={styles.link}
              >
                The menu
              </Link>
              <Link to="/#today" className={styles.link}>
                Today’s brew
              </Link>
              <Link to="/#visit" className={styles.link}>
                Visit us
              </Link>
            </>
          )}
          <a href={telHref(contact.phone)} className={styles.phone}>
            <PhoneGlyph />
            {contact.phone}
          </a>
        </nav>
      </div>
    </header>
  );
}
