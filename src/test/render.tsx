import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { createSeedStore } from '../lib/seed';
import type { SiteContent, Store } from '../lib/types';
import { clone } from '../lib/utils';
import HoursPage from '../pages/dashboard/HoursPage';
import MenuPricesPage from '../pages/dashboard/MenuPricesPage';
import PhotosPage from '../pages/dashboard/PhotosPage';
import TodayPage from '../pages/dashboard/TodayPage';
import HomePage from '../pages/site/HomePage';
import MenuPage from '../pages/site/MenuPage';
import { StoreProvider } from '../store/StoreProvider';

/** A store whose draft and published copies both start from the seed, edited by `recipe`. */
export function storeWith(recipe?: (content: SiteContent) => void): Store {
  const store = createSeedStore();
  if (recipe) {
    recipe(store.draft);
    store.published = clone(store.draft);
  }
  return store;
}

/** Renders the whole app's routes (minus lazy loading) at `path`. */
export function renderApp(path: string, store: Store = createSeedStore()) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider initialStore={store}>
        <AppRoutes />
      </StoreProvider>
    </MemoryRouter>,
  );
}

function AppRoutes(): ReactNode {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<TodayPage />} />
        <Route path="menu" element={<MenuPricesPage />} />
        <Route path="photos" element={<PhotosPage />} />
        <Route path="hours" element={<HoursPage />} />
      </Route>
    </Routes>
  );
}
