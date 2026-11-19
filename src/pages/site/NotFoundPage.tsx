import { PublicPage } from '../../components/site/PublicPage';
import { CartoonLink, OutlinedHeading } from '../../components/ui';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <PublicPage page="other" title="Page not found · ’Wiches Cauldron" footerWave="var(--cream)">
      <main id="main" tabIndex={-1} className={styles.main}>
        <OutlinedHeading as="h1" outline={3} className={styles.title}>
          This page fell in the pot.
        </OutlinedHeading>
        <p className={styles.text}>We couldn’t find what you were looking for.</p>
        <div className={styles.actions}>
          <CartoonLink to="/" variant="secondary" size="lg">
            Back to the home page
          </CartoonLink>
          <CartoonLink to="/menu" variant="primary" size="lg">
            See the menu
          </CartoonLink>
        </div>
      </main>
    </PublicPage>
  );
}
