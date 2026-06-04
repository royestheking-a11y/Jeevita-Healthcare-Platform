import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { DataProvider, useData } from './contexts/DataContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { JeeviAssistant } from './components/JeeviAssistant';
import { SplashScreen } from './components/SplashScreen';
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
import { EmergencyPage } from './pages/EmergencyPage';
import { NearestHospitalPage } from './pages/NearestHospitalPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { Toaster } from './components/ui/sonner';
import { NotificationService } from './utils/notifications';

// Wrapper component to handle navigation prop
// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Session handler to redirect to home on new session (browser restart)
function SessionHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if this is a new session
    const hasVisited = sessionStorage.getItem('hasVisited');

    if (!hasVisited) {
      // If no session flag and not on homepage, redirect to home
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
      // Set session flag
      sessionStorage.setItem('hasVisited', 'true');
    }
  }, []); // Run once on mount

  return null;
}

function PageWrapper({ Component, showNavbar = true, showFooter = true, showAssistant = true }: any) {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const handleNavigate = (page: string, data?: any) => {
    if (page === 'doctor-profile' && data?.doctorId) {
      navigate(`/doctor-profile/${data.doctorId}`);
    } else if (page === 'medicine-details' && data?.medicineId) {
      navigate(`/medicine-details/${data.medicineId}`);
    } else if (page === 'hospital-details' && data?.hospitalId) {
      navigate(`/hospital-details/${data.hospitalId}`);
    } else if (page === 'booking' && data?.doctorId) {
      navigate(`/booking/${data.doctorId}`);
    } else if (data) {
      // For other pages with data, navigate with state
      navigate(`/${page}`, { state: data });
    } else {
      navigate(`/${page === 'home' ? '' : page}`);
    }
  };

  return (
    <>
      {showNavbar && <Navbar onNavigate={handleNavigate} currentPage="" />}
      <main className="flex-1">
        <Component onNavigate={handleNavigate} {...params} {...location.state} />
      </main>
      {showFooter && <Footer onNavigate={handleNavigate} />}
      {showAssistant && <JeeviAssistant onNavigate={handleNavigate} />}
    </>
  );
}

// Admin login wrapper
function AdminLoginWrapper() {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    navigate('/admin');
  };

  const handleNavigate = (page: string) => {
    navigate(`/${page === 'home' ? '' : page}`);
  };

  return <AdminLoginPage onNavigate={handleNavigate} onAdminLogin={handleAdminLogin} />;
}

// Admin route protection
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // If user is logged in as admin, show admin panel
  if (isAdmin) {
    return <>{children}</>;
  }

  // Otherwise redirect to admin login
  return <AdminLoginPage onNavigate={(page) => navigate(`/${page}`)} onAdminLogin={() => navigate('/admin')} />;
}

function AppContent() {
  const { user } = useAuth();
  const { loading } = useData(); // Get loading state from DataContext

  // Initialize splash state:
  // If loading is true (uncached), show splash.
  // If loading is false (cached), don't show splash.
  const [showSplash, setShowSplash] = useState(loading);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Timer effect: Only runs if splash is shown
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setMinTimeElapsed(true);
      }, 3000); // 3 seconds minimum display
      return () => clearTimeout(timer);
    } else {
      // If splash is not shown initially, we consider time elapsed immediately
      setMinTimeElapsed(true);
    }
  }, [showSplash]);

  // Hiding effect: Only hide when BOTH loading is done AND time is up
  useEffect(() => {
    if (!loading && minTimeElapsed) {
      setShowSplash(false);
    }
  }, [loading, minTimeElapsed]);

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

  if (showSplash) {
    return <SplashScreen />;
  }

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
        <Route path="/doctor-profile/:doctorId" element={<PageWrapper Component={DoctorProfilePage} />} />
        <Route path="/medicine-details/:medicineId" element={<PageWrapper Component={MedicineDetailsPage} />} />
        <Route path="/hospital-details/:hospitalId" element={<PageWrapper Component={HospitalDetailsPage} />} />
        <Route path="/emergency" element={<PageWrapper Component={EmergencyPage} />} />
        <Route path="/booking/:doctorId" element={<PageWrapper Component={BookingPage} />} />

        {/* User routes */}
        <Route path="/cart" element={<PageWrapper Component={CartPage} />} />
        <Route path="/payment" element={<PageWrapper Component={PaymentPage} />} />
        <Route path="/dashboard" element={<PageWrapper Component={DashboardPage} showNavbar={false} showFooter={false} showAssistant={false} />} />
        <Route path="/dashboard/:section" element={<PageWrapper Component={DashboardPage} showNavbar={false} showFooter={false} showAssistant={false} />} />

        {/* Admin routes */}
        <Route
          path="/admin-login"
          element={
            <AdminLoginWrapper />
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <PageWrapper Component={AdminPanel} showNavbar={false} showFooter={false} showAssistant={false} />
            </AdminRoute>
          }
        />

        <Route path="/near-hospitals" element={<PageWrapper Component={NearestHospitalPage} />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
}

import { GtagLoader } from './components/GtagLoader';

export default function App() {
  return (
    <BrowserRouter>
      <GtagLoader />
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <DataProvider>
                <ScrollToTop />
                <SessionHandler />
                <AppContent />
              </DataProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
