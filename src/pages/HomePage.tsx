import React from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { DoctorCard } from '../components/DoctorCard';
import { MedicineCard } from '../components/MedicineCard';
import { HospitalCard } from '../components/HospitalCard';
import { PrescriptionUploadSection } from '../components/PrescriptionUploadSection';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HomeSeo } from '../seo-pages/HomeSeo';

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { t } = useLanguage();
  const { doctors, medicines, hospitals, carouselSlides } = useData();

  return (
    <div className="bg-white">
      <HomeSeo />
      {/* Hero Carousel */}
      <HeroCarousel onNavigate={onNavigate} />

      {/* Featured Doctors Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-gray-900 mb-2">{t('doctors.title')}</h2>
            <p className="text-gray-600">
              Book appointments with top specialists
            </p>
          </div>
          <Button
            onClick={() => onNavigate('doctors')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
          >
            {t('common.viewAll')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.slice(0, 3).map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onBookAppointment={(id) => onNavigate('booking', { doctorId: id })}
              onViewProfile={(id) => onNavigate('doctor-profile', { doctorId: id })}
            />
          ))}
        </div>
      </section>

      {/* Prescription Upload Section */}
      <PrescriptionUploadSection onNavigate={onNavigate} />

      {/* Featured Medicines Section */}
      <section className="bg-gradient-to-br from-amber-50 via-orange-50/20 to-amber-100/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-gray-900 mb-2">{t('medicines.title')}</h2>
              <p className="text-gray-600">
                Fast & reliable medicine delivery
              </p>
            </div>
            <Button
              onClick={() => onNavigate('medicines')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
            >
              {t('common.viewAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {medicines.slice(0, 4).map((medicine) => (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                onViewDetails={(id) => onNavigate('medicine-details', { medicineId: id })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Hospitals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-gray-900 mb-2">Top Hospitals in Bangladesh</h2>
            <p className="text-gray-600">
              Partner hospitals across Bangladesh
            </p>
          </div>
          <Button
            onClick={() => onNavigate('hospitals')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
          >
            {t('common.viewAll')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.slice(0, 3).map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              onViewDetails={(id) => onNavigate('hospital-details', { hospitalId: id })}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Join 10,000+ Happy Users</span>
          </div>
          <h2 className="mb-4">Ready to Take Care of Your Health?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of satisfied users who trust Jeevita for their healthcare needs
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => onNavigate('signup')}
              className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-6 shadow-2xl"
              size="lg"
            >
              Get Started Today
            </Button>
            <Button
              onClick={() => onNavigate('doctors')}
              className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-6 shadow-2xl"
              size="lg"
            >
              Browse Doctors
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
