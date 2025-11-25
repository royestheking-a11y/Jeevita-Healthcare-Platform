import React, { useState, useEffect } from 'react';
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

type Page =
  | 'home'
  | 'doctors'
  | 'medicines'
  | 'hospitals'
  | 'login'
  | 'signup'
  | 'booking'
  | 'cart'
  | 'payment'
  | 'dashboard'
  | 'admin'
  | 'admin-login'
  | 'doctor-profile'
  | 'medicine-details'
  | 'hospital-details'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms';

interface NavigationState {
  page: Page;
  data?: any;
}

function AppContent() {
  const { user } = useAuth();
  const [navigation, setNavigation] = useState<NavigationState>({
    page: 'home',
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

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

  const handleNavigate = (page: string, data?: any) => {
    setNavigation({ page: page as Page, data });
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (navigation.page) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'doctors':
        return <DoctorsPage onNavigate={handleNavigate} />;
      case 'medicines':
        return <MedicinesPage onNavigate={handleNavigate} />;
      case 'hospitals':
        return <HospitalsPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'signup':
        return <SignupPage onNavigate={handleNavigate} />;
      case 'booking':
        return (
          <BookingPage
            doctorId={navigation.data?.doctorId}
            onNavigate={handleNavigate}
          />
        );
      case 'cart':
        return <CartPage onNavigate={handleNavigate} />;
      case 'payment':
        return (
          <PaymentPage
            paymentData={navigation.data}
            onNavigate={handleNavigate}
          />
        );
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'admin-login':
        return (
          <AdminLoginPage
            onNavigate={handleNavigate}
            onAdminLogin={() => {
              setIsAdminAuthenticated(true);
              handleNavigate('admin');
            }}
          />
        );
      case 'admin':
        if (!isAdminAuthenticated) {
          handleNavigate('admin-login');
          return <AdminLoginPage onNavigate={handleNavigate} onAdminLogin={() => {
            setIsAdminAuthenticated(true);
            handleNavigate('admin');
          }} />;
        }
        return <AdminPanel onNavigate={handleNavigate} />;
      case 'doctor-profile':
        return (
          <DoctorProfilePage
            doctorId={navigation.data?.doctorId}
            onNavigate={handleNavigate}
          />
        );
      case 'medicine-details':
        return (
          <MedicineDetailsPage
            medicineId={navigation.data?.medicineId}
            onNavigate={handleNavigate}
          />
        );
      case 'hospital-details':
        return (
          <HospitalDetailsPage
            hospitalId={navigation.data?.hospitalId}
            onNavigate={handleNavigate}
          />
        );
      case 'about':
        return <AboutUsPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactUsPage onNavigate={handleNavigate} />;
      case 'privacy':
        return <PrivacyPolicyPage onNavigate={handleNavigate} />;
      case 'terms':
        return <TermsOfServicePage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
            <div className="min-h-screen flex flex-col">
              {navigation.page !== 'admin-login' && navigation.page !== 'admin' && (
                <Navbar
                  onNavigate={handleNavigate}
                  currentPage={navigation.page}
                />
              )}
              <main className="flex-1">{renderPage()}</main>
              {navigation.page !== 'admin' && navigation.page !== 'admin-login' && navigation.page !== 'dashboard' && (
                <Footer onNavigate={handleNavigate} />
              )}
              {navigation.page !== 'admin-login' && navigation.page !== 'admin' && (
                <JeeviAssistant onNavigate={handleNavigate} />
              )}
              <Toaster />
            </div>
  );
}

export default function App() {
  return (
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
  );
}
