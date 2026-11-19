import type { ReactNode } from 'react';
import { usePageSetup } from '../../hooks/usePageSetup';
import { cx } from '../../lib/utils';
import { Awning } from '../ui';
import styles from './PublicPage.module.css';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

type PublicPageProps = {
  page: 'home' | 'menu' | 'other';
  title: string;
  /** Colour of the last section, which the footer's wave melts into. */
  footerWave: string;
  /** The page's <main id="main">. */
  children: ReactNode;
};

/** Awning, header and footer around a public page, on the cream paper texture. */
export function PublicPage({ page, title, footerWave, children }: PublicPageProps) {
  usePageSetup(title, 'site');

  return (
    <div className={cx('tx-cream', styles.page)}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Awning />
      <SiteHeader page={page} />
      {children}
      <SiteFooter waveFill={footerWave} />
    </div>
  );
}
