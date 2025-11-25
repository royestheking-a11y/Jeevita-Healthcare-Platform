import React from 'react';
import { Star, Calendar, MapPin, Award, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useLanguage } from '../contexts/LanguageContext';

interface DoctorCardProps {
  doctor: {
    id: string;
    name: string;
    specialty: string;
    degrees: string;
    experience: number;
    rating: number;
    image: string;
    location: string;
    fee: number;
  };
  onBookAppointment: (doctorId: string) => void;
  onViewProfile: (doctorId: string) => void;
}

export function DoctorCard({ doctor, onBookAppointment, onViewProfile }: DoctorCardProps) {
  const { t } = useLanguage();

  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-amber-100 hover:border-amber-300">
      {/* Header with gradient */}
      <div className="relative h-32 bg-gradient-to-br from-amber-500 to-orange-500">
        <div className="absolute -bottom-12 left-6">
          <div className="relative">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
          </div>
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-white/95 text-gray-900 hover:bg-white border-0 shadow-lg">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500 mr-1" />
            {doctor.rating}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 px-6 pb-6">
        <h3 className="text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
          {doctor.name}
        </h3>
        <p className="text-amber-600 mb-2">{doctor.specialty}</p>
        
        {/* Degrees */}
        <div className="flex items-start gap-2 mb-4">
          <Award className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 line-clamp-2">{doctor.degrees}</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-amber-400" />
            <span className="text-gray-600">{doctor.experience} yrs</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-amber-400" />
            <span className="text-gray-600 truncate">{doctor.location}</span>
          </div>
        </div>

        {/* Fee */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-600 mb-1">Consultation Fee</p>
          <p className="text-amber-600">৳{doctor.fee}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => onViewProfile(doctor.id)}
            variant="outline"
            className="flex-1 border-amber-200 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50"
          >
            View Profile
          </Button>
          <Button
            onClick={() => onBookAppointment(doctor.id)}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
