import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingForm } from './pages/BookingForm';
import { Login } from './pages/Login';
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { Overview } from './pages/dashboard/Overview';
import { Leads } from './pages/dashboard/Leads';
import { Bookings } from './pages/dashboard/Bookings';
import { BookingDetail } from './pages/dashboard/BookingDetail';
import { Clients } from './pages/dashboard/Clients';
import { Services } from './pages/dashboard/Services';
import { Settings } from './pages/dashboard/Settings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Client Booking Form */}
          <Route path="/book" element={<BookingForm />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />

          {/* James's Protected Dashboard */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="leads" element={<Leads />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="clients" element={<Clients />} />
            <Route path="services" element={<Services />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/book" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
