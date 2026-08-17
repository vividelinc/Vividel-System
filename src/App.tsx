import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './components/layout/PublicLayout';
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
import Home from './pages/Home';
import PortfolioPage from './pages/Portfolio';
import ServicesPage from './pages/Services';
import AboutPage from './pages/About';
import TestimonialsPage from './pages/Testimonials';
import ContactPage from './pages/Contact';
import PrivacyPage from './pages/Privacy';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
          </Route>

          <Route path="/book" element={<BookingForm />} />

          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="leads" element={<Leads />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="clients" element={<Clients />} />
            <Route path="services" element={<Services />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
