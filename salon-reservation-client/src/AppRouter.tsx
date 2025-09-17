import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ReservationsPage from './pages/ReservationsPage';
import CustomersPage from './pages/CustomersPage';
import DesignersPage from './pages/DesignersPage';
import BusinessHoursPage from './pages/BusinessHoursPage';
import StatisticsPage from './pages/StatisticsPage';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/reservations" replace />} />
      <Route path="/reservations" element={<ReservationsPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/designers" element={<DesignersPage />} />
      <Route path="/business-hours" element={<BusinessHoursPage />} />
      <Route path="/statistics" element={<StatisticsPage />} />
      <Route path="*" element={<Navigate to="/reservations" replace />} />
    </Routes>
  );
};

export default AppRouter;