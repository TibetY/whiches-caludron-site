import type { IconName } from '../icons/Icon';

export type DashboardPage = {
  path: string;
  label: string;
  icon: IconName;
  /** Success message after publishing from this page. */
  toastText: string;
  /** Where “See it on the website” goes. */
  toastHref: string;
};

export const DASHBOARD_PAGES: DashboardPage[] = [
  {
    path: '/dashboard',
    label: 'Today’s brew',
    icon: 'brew',
    toastText: 'Published! Today’s brew is live on the website.',
    toastHref: '/',
  },
  {
    path: '/dashboard/menu',
    label: 'Menu & prices',
    icon: 'list',
    toastText: 'Published! Your menu page is up to date.',
    toastHref: '/menu',
  },
  {
    path: '/dashboard/photos',
    label: 'Photos',
    icon: 'camera',
    toastText: 'Published! Your new photos are on the website.',
    toastHref: '/',
  },
  {
    path: '/dashboard/hours',
    label: 'Hours & notices',
    icon: 'clock',
    toastText: 'Published! Your hours and notices are up to date.',
    toastHref: '/',
  },
];

export function pageFor(pathname: string): DashboardPage {
  const path = pathname.replace(/\/+$/, '');
  return DASHBOARD_PAGES.find((page) => page.path === path) ?? DASHBOARD_PAGES[0];
}
