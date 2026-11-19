import logo from '@assets/logo-sticker.webp';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useNow } from '../../hooks/useNow';
import { formatDateLabel } from '../../lib/hours';
import type { SiteContent } from '../../lib/types';
import { cx } from '../../lib/utils';
import { useStore } from '../../store/context';
import { Icon } from '../icons/Icon';
import { CartoonButton, CartoonLink } from '../ui';
import { DashboardContext, type DashboardApi } from './context';
import styles from './DashboardLayout.module.css';
import { DASHBOARD_PAGES, pageFor } from './pages';
import { StatusPill } from './StatusPill';

/**
 * Dashboard shell. Phones get the top bar and sticky Publish bar from Admin-Phone.dc.html;
 * from 900px the purple sidebar from the desktop artboards takes over.
 */
export default function DashboardLayout() {
  const { pathname } = useLocation();
  const page = pageFor(pathname);
  const { draft, publish } = useStore();
  const now = useNow();

  // The menu and the toast belong to the page they were opened on, so they close on navigation.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const [published, setPublished] = useState<{ draft: SiteContent; path: string } | null>(null);
  const menuOpen = menuOpenOn === pathname;
  // The toast stays until the next edit.
  const toastVisible =
    published !== null && published.draft === draft && published.path === pathname;

  const handlePublish = useCallback(() => {
    publish();
    setPublished({ draft, path: pathname });
  }, [publish, draft, pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpenOn(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const api = useMemo<DashboardApi>(
    () => ({
      publish: handlePublish,
      toastVisible,
      toastText: page.toastText,
      toastHref: page.toastHref,
      now,
    }),
    [handlePublish, toastVisible, page, now],
  );

  return (
    <DashboardContext.Provider value={api}>
      <div className={cx('tx-cream', styles.shell)}>
        <a className="skip-link" href="#dashboard-main">
          Skip to content
        </a>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <Link to="/" className={styles.brand}>
              <img src={logo} alt="" width="62" height="75" className={styles.brandLogo} />
              <span className={styles.brandText}>
                <span className={styles.brandName}>’wiches cauldron</span>
                <span className={styles.brandSub}>Shop dashboard</span>
              </span>
            </Link>
            <DashboardNav />
            <SidebarFooter />
          </div>
        </aside>

        <header className={styles.topbar}>
          <div className={styles.topbarRow}>
            <img src={logo} alt="" width="44" height="53" className={styles.topLogo} />
            <div className={styles.topTitles}>
              <div className={styles.phoneOnly}>
                <div className={styles.topTitle}>{page.label}</div>
                <div className={styles.topSub}>{formatDateLabel(now)}</div>
                <StatusPill compact className={styles.topPill} />
              </div>
              <div className={styles.tabletOnly}>
                <div className={styles.topTitle}>’wiches cauldron</div>
                <div className={styles.topSub}>Shop dashboard</div>
              </div>
            </div>
            <button
              type="button"
              className={styles.menuButton}
              aria-expanded={menuOpen}
              aria-controls="dashboard-menu"
              aria-label={menuOpen ? 'Close the dashboard menu' : 'Open the dashboard menu'}
              onClick={() => setMenuOpenOn(menuOpen ? null : pathname)}
            >
              <Icon name={menuOpen ? 'close' : 'menu'} size={24} strokeWidth={2.6} />
            </button>
          </div>
          <div id="dashboard-menu" className={styles.mobileMenu} hidden={!menuOpen}>
            <DashboardNav />
            <SidebarFooter />
          </div>
        </header>

        <main id="dashboard-main" tabIndex={-1} className={styles.main}>
          <Outlet />
        </main>

        <div className={styles.publishBar}>
          <CartoonButton className={styles.publishBarButton} onClick={handlePublish}>
            Publish changes
          </CartoonButton>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}

function DashboardNav() {
  return (
    <nav aria-label="Dashboard" className={styles.nav}>
      {DASHBOARD_PAGES.map((item) => (
        <NavLink key={item.path} to={item.path} end className={styles.navLink}>
          <Icon name={item.icon} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarFooter() {
  const { reset } = useStore();
  const onReset = () => {
    if (
      window.confirm('Reset all content and photos to the demo data? Your changes will be lost.')
    ) {
      void reset();
    }
  };
  return (
    <div className={styles.footer}>
      <CartoonLink to="/" variant="secondary" className={styles.viewSite}>
        <Icon name="external" size={20} />
        View the website
      </CartoonLink>
      <button type="button" className={styles.resetButton} onClick={onReset}>
        <Icon name="reset" size={18} strokeWidth={2.4} />
        Reset demo data
      </button>
      <p className={styles.note}>
        Prototype: <strong>no login yet</strong>
      </p>
    </div>
  );
}
