import React, { useState } from 'react';
import { HospitalCard } from '../components/HospitalCard';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';

interface HospitalsPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function HospitalsPage({ onNavigate }: HospitalsPageProps) {
  const { t } = useLanguage();
  const { hospitals } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a202c] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 dark:text-white mb-2">{t('hospitals.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore our network of partner hospitals across Bangladesh
          </p>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-[#2d3748] rounded-lg shadow-md p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search hospitals by name, location, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Showing {filteredHospitals.length} hospital{filteredHospitals.length !== 1 ? 's' : ''}
        </p>

        {/* Hospitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              onViewDetails={(id) => onNavigate('hospital-details', { hospitalId: id })}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredHospitals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No hospitals found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
