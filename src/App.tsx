import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ScrollManager } from './components/ScrollManager';
import HomePage from './pages/site/HomePage';
import MenuPage from './pages/site/MenuPage';
import NotFoundPage from './pages/site/NotFoundPage';

// Visitors never need the dashboard code, so it loads on its own.
const DashboardRoutes = lazy(() => import('./pages/dashboard/DashboardRoutes'));

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route
          path="/dashboard/*"
          element={
            <Suspense fallback={null}>
              <DashboardRoutes />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
