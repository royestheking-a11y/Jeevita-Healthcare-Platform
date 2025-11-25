import React from 'react';
import { MapPin, Building2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { Badge } from './ui/badge';

interface HospitalCardProps {
  hospital: {
    id: string;
    name: string;
    address: string;
    specialty: string;
    image: string;
  };
  onViewDetails: (hospitalId: string) => void;
}

export function HospitalCard({ hospital, onViewDetails }: HospitalCardProps) {
  const { t } = useLanguage();

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-amber-200">
      {/* Hospital Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
        <img
          src={hospital.image}
          alt={hospital.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute top-3 right-3">
          <Badge className="bg-amber-500 text-white border-0 shadow-lg">
            <Building2 className="h-3 w-3 mr-1" />
            Hospital
          </Badge>
        </div>
      </div>

      {/* Hospital Info */}
      <div className="p-6">
        <h3 className="text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">{hospital.name}</h3>
        
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
          <p className="line-clamp-2">{hospital.address}</p>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <p className="text-sm text-gray-700">
            <span className="font-medium text-amber-600">Specialty:</span> {hospital.specialty}
          </p>
        </div>

        <Button
          onClick={() => onViewDetails(hospital.id)}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 group-hover:shadow-xl group-hover:shadow-amber-500/40 transition-all"
        >
          {t('hospitals.viewDetails')}
        </Button>
      </div>
    </div>
  );
}
