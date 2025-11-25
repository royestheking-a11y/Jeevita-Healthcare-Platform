import React from 'react';
import { ArrowLeft, MapPin, Phone, Clock, Star, Building2, Users, Stethoscope, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useData } from '../contexts/DataContext';

interface HospitalDetailsPageProps {
  onNavigate: (page: string) => void;
  hospitalId: string;
}

export function HospitalDetailsPage({ onNavigate, hospitalId }: HospitalDetailsPageProps) {
  const { hospitals } = useData();
  const hospital = hospitals.find(h => h.id === hospitalId);

  if (!hospital) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Hospital not found</p>
            <Button onClick={() => onNavigate('hospitals')} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              Back to Hospitals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const departments = hospital.departments && hospital.departments.length > 0 
    ? hospital.departments 
    : ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'General Surgery', 'Emergency Care', 'ICU'];

  const facilities = hospital.facilities && hospital.facilities.length > 0
    ? hospital.facilities
    : ['24/7 Emergency Service', 'Modern ICU', 'Digital X-Ray', 'CT Scan & MRI', 'Laboratory Services', 'Pharmacy', 'Ambulance Service', 'Blood Bank'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          onClick={() => onNavigate('hospitals')}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Hospitals
        </Button>

        {/* Hero Section */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="h-64 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-lg relative overflow-hidden">
              <img
                src={hospital.image}
                alt={hospital.name}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-white mb-2">{hospital.name}</h1>
                <div className="flex items-center gap-4 text-white">
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Star className="h-3 w-3 mr-1 fill-white" />
                    {hospital.rating || 4.8}
                  </Badge>
                  <span className="text-sm">{hospital.beds || '200+ Beds'}</span>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm text-gray-900">{hospital.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm text-gray-900">{hospital.phone || '+880 1700-000000'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Hours</p>
                    <p className="text-sm text-gray-900">{hospital.hours || '24/7 Available'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About Hospital</CardTitle>
              </CardHeader>
              <CardContent>
                {hospital.description ? (
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{hospital.description}</p>
                ) : (
                  <>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {hospital.name} is a leading healthcare institution in Bangladesh, providing comprehensive medical services 
                  with state-of-the-art facilities and experienced medical professionals. Specializing in {hospital.specialty}, 
                  we are committed to delivering excellence in patient care.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our hospital is equipped with modern medical technology and staffed by highly qualified doctors, nurses, 
                  and healthcare professionals who work together to ensure the best possible outcomes for our patients.
                </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Departments */}
            <Card>
              <CardHeader>
                <CardTitle>Departments & Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {departments.map((dept, index) => (
                    <div key={index} className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <Stethoscope className="h-4 w-4 text-amber-600 mb-1" />
                      <p className="text-sm text-gray-700">{dept}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Facilities */}
            <Card>
              <CardHeader>
                <CardTitle>Facilities & Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {facilities.map((facility, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <p className="text-sm text-gray-700">{facility}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Hospital Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Specialty</p>
                  <p className="text-amber-600">{hospital.specialty}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Total Beds</p>
                      <p className="text-sm text-gray-900">{hospital.beds || '200+ Beds'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Staff</p>
                      <p className="text-sm text-gray-900">{hospital.staff || '200+ Medical Staff'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{hospital.email || `info@${hospital.name.toLowerCase().replace(/\s+/g, '')}.com`}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => onNavigate('doctors')}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Find Doctors Here
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Hospital
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
