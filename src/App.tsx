import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { DataProvider } from './contexts/DataContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { JeeviAssistant } from './components/JeeviAssistant';
import { HomePage } from './pages/HomePage';
import { DoctorsPage } from './pages/DoctorsPage';
import { MedicinesPage } from './pages/MedicinesPage';
import { HospitalsPage } from './pages/HospitalsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { BookingPage } from './pages/BookingPage';
import { CartPage } from './pages/CartPage';
import { PaymentPage } from './pages/PaymentPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPanel } from './pages/AdminPanel';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { DoctorProfilePage } from './pages/DoctorProfilePage';
import { MedicineDetailsPage } from './pages/MedicineDetailsPage';
import { HospitalDetailsPage } from './pages/HospitalDetailsPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { Toaster } from './components/ui/sonner';
import { NotificationService } from './utils/notifications';

// Wrapper component to handle navigation prop
function PageWrapper({ Component, showNavbar = true, showFooter = true, showAssistant = true }: any) {
  const navigate = useNavigate();

  const handleNavigate = (page: string, data?: any) => {
    if (data) {
      // For pages with data, navigate with state
      navigate(`/${page}`, { state: data });
    } else {
      navigate(`/${page === 'home' ? '' : page}`);
    }
  };

  return (
    <>
      {showNavbar && <Navbar onNavigate={handleNavigate} currentPage="" />}
      <main className="flex-1">
        <Component onNavigate={handleNavigate} />
      </main>
      {showFooter && <Footer onNavigate={handleNavigate} />}
      {showAssistant && <JeeviAssistant onNavigate={handleNavigate} />}
    </>
  );
}

// Admin route protection
function AdminRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <AdminLoginPage onNavigate={(page) => navigate(`/${page}`)} onAdminLogin={() => setIsAuthenticated(true)} />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();

  // Request notification permission when user logs in
  useEffect(() => {
    if (user && user.role !== 'admin') {
      NotificationService.requestPermission().then((granted) => {
        if (granted) {
          console.log('Notification permission granted');
        }
      });
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PageWrapper Component={HomePage} />} />
        <Route path="/doctors" element={<PageWrapper Component={DoctorsPage} />} />
        <Route path="/medicines" element={<PageWrapper Component={MedicinesPage} />} />
        <Route path="/hospitals" element={<PageWrapper Component={HospitalsPage} />} />
        <Route path="/login" element={<PageWrapper Component={LoginPage} />} />
        <Route path="/signup" element={<PageWrapper Component={SignupPage} />} />
        <Route path="/about" element={<PageWrapper Component={AboutUsPage} />} />
        <Route path="/contact" element={<PageWrapper Component={ContactUsPage} />} />
        <Route path="/privacy" element={<PageWrapper Component={PrivacyPolicyPage} />} />
        <Route path="/terms" element={<PageWrapper Component={TermsOfServicePage} />} />

        {/* Dynamic routes */}
        <Route path="/doctor-profile" element={<PageWrapper Component={DoctorProfilePage} />} />
        <Route path="/medicine-details" element={<PageWrapper Component={MedicineDetailsPage} />} />
        <Route path="/hospital-details" element={<PageWrapper Component={HospitalDetailsPage} />} />
        <Route path="/booking" element={<PageWrapper Component={BookingPage} />} />

        {/* User routes */}
        <Route path="/cart" element={<PageWrapper Component={CartPage} />} />
        <Route path="/payment" element={<PageWrapper Component={PaymentPage} />} />
        <Route path="/dashboard" element={<PageWrapper Component={DashboardPage} showFooter={false} />} />

        {/* Admin routes */}
        <Route path="/admin-login" element={<PageWrapper Component={AdminLoginPage} showNavbar={false} showFooter={false} showAssistant={false} />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <PageWrapper Component={AdminPanel} showNavbar={false} showFooter={false} showAssistant={false} />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <DataProvider>
                <AppContent />
              </DataProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
