import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.doctors': 'Doctors',
    'nav.medicines': 'Medicines',
    'nav.hospitals': 'Hospitals',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    'nav.search': 'Search doctors, medicines, hospitals...',
    
    // Hero
    'hero.title1': 'Find the Best Doctors',
    'hero.subtitle1': 'Book appointments with top specialists in Bangladesh',
    'hero.cta1': 'Book Appointment Now',
    'hero.title2': 'Order Medicines Online',
    'hero.subtitle2': 'Fast & reliable medicine delivery at your doorstep',
    'hero.cta2': 'Order Medicine Now',
    'hero.title3': 'Your Health, Our Priority',
    'hero.subtitle3': 'Comprehensive healthcare solutions for Bangladesh',
    'hero.cta3': 'Learn More',
    
    // Doctors
    'doctors.title': 'Find the Right Specialist for You',
    'doctors.filter.specialty': 'Specialty',
    'doctors.filter.location': 'Location',
    'doctors.filter.experience': 'Experience',
    'doctors.filter.rating': 'Rating',
    'doctors.viewProfile': 'View Profile',
    'doctors.bookAppointment': 'Book Appointment',
    'doctors.experience': 'years experience',
    
    // Medicines
    'medicines.title': 'Order Medicines Easily',
    'medicines.uploadPrescription': 'Upload Prescription',
    'medicines.filter.category': 'Category',
    'medicines.filter.brand': 'Brand',
    'medicines.filter.price': 'Price Range',
    'medicines.addToCart': 'Add to Cart',
    'medicines.inStock': 'In Stock',
    'medicines.outOfStock': 'Out of Stock',
    
    // Hospitals
    'hospitals.title': 'Top Hospitals in Bangladesh',
    'hospitals.viewDetails': 'View Details',
    
    // Footer
    'footer.description': "Jeevita – Bangladesh's trusted digital healthcare platform. From doctor booking to medicine delivery — all at your fingertips.",
    'footer.about': 'About',
    'footer.privacy': 'Privacy Policy',
    'footer.contact': 'Contact',
    'footer.adminPanel': 'Admin Panel',
    'footer.copyright': '© 2025 Jeevita. Designed & Developed by Aura.',
    
    // Common
    'common.viewAll': 'View All',
    'common.bookNow': 'Book Now',
    'common.learnMore': 'Learn More',
  },
  bn: {
    // Navigation
    'nav.doctors': 'ডাক্তার',
    'nav.medicines': 'ঔষধ',
    'nav.hospitals': 'হাসপাতাল',
    'nav.login': 'লগইন',
    'nav.signup': 'সাইন আপ',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.logout': 'লগআউট',
    'nav.search': 'ডাক্তার, ঔষধ, হাসপাতাল খুঁজুন...',
    
    // Hero
    'hero.title1': 'সেরা ডাক্তার খুঁজুন',
    'hero.subtitle1': 'বাংলাদেশের শীর্ষ বিশেষজ্ঞদের সাথে অ্যাপয়েন্টমেন্ট বুক করুন',
    'hero.cta1': 'এখনই অ্যাপয়েন্টমেন্ট বুক করুন',
    'hero.title2': 'অনলাইনে ঔষধ অর্ডার করুন',
    'hero.subtitle2': 'আপনার দোরগোড়ায় দ্রুত ও নির্ভরযোগ্য ঔষধ সরবরাহ',
    'hero.cta2': 'এখনই ঔষধ অর্ডার করুন',
    'hero.title3': 'আপনার স্বাস্থ্য, আমাদের অগ্রাধিকার',
    'hero.subtitle3': 'বাংলাদেশের জন্য সম্পূর্ণ স্বাস্থ্যসেবা সমাধান',
    'hero.cta3': 'আরও জানুন',
    
    // Doctors
    'doctors.title': 'আপনার জন্য সঠিক বিশেষজ্ঞ খুঁজুন',
    'doctors.filter.specialty': 'বিশেষত্ব',
    'doctors.filter.location': 'অবস্থান',
    'doctors.filter.experience': 'অভিজ্ঞতা',
    'doctors.filter.rating': 'রেটিং',
    'doctors.viewProfile': 'প্রোফাইল দেখুন',
    'doctors.bookAppointment': 'অ্যাপয়েন্টমেন্ট বুক করুন',
    'doctors.experience': 'বছর অভিজ্ঞতা',
    
    // Medicines
    'medicines.title': 'সহজে ঔষধ অর্ডার করুন',
    'medicines.uploadPrescription': 'প্রেসক্রিপশন আপলোড করুন',
    'medicines.filter.category': 'বিভাগ',
    'medicines.filter.brand': 'ব্র্যান্ড',
    'medicines.filter.price': 'মূল্য পরিসীমা',
    'medicines.addToCart': 'কার্টে যোগ করুন',
    'medicines.inStock': 'স্টকে আছে',
    'medicines.outOfStock': 'স্টকে নেই',
    
    // Hospitals
    'hospitals.title': 'বাংলাদেশের শীর্ষ হাসপাতাল',
    'hospitals.viewDetails': 'বিস্তারিত দেখুন',
    
    // Footer
    'footer.description': 'জীবিতা – বাংলাদেশের বিশ্বস্ত ডিজিটাল স্বাস্থ্যসেবা প্ল্যাটফর্ম। ডাক্তার বুকিং থেকে ঔষধ সরবরাহ পর্যন্ত — সবকিছু আপনার হাতের মুঠোয়।',
    'footer.about': 'সম্পর্কে',
    'footer.privacy': 'গোপনীয়তা নীতি',
    'footer.contact': 'যোগাযোগ',
    'footer.adminPanel': 'অ্যাডমিন প্যানেল',
    'footer.copyright': '© ২০২৫ জীবিতা। ডিজাইন ও ডেভেলপমেন্ট: অরা।',
    
    // Common
    'common.viewAll': 'সব দেখুন',
    'common.bookNow': 'এখনই বুক করুন',
    'common.learnMore': 'আরও জানুন',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'bn' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
