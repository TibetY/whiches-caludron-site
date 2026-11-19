import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import HoursPage from './HoursPage';
import MenuPricesPage from './MenuPricesPage';
import PhotosPage from './PhotosPage';
import TodayPage from './TodayPage';

/** /dashboard and its pages, loaded as a separate chunk. */
export default function DashboardRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<TodayPage />} />
        <Route path="menu" element={<MenuPricesPage />} />
        <Route path="photos" element={<PhotosPage />} />
        <Route path="hours" element={<HoursPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
