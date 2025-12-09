import React from 'react';
import { ArrowLeft, Calendar, Star, MapPin, Award, Briefcase, GraduationCap, Clock, Phone, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useData } from '../contexts/DataContext';
import { useParams } from 'react-router-dom';
import { DoctorProfileSeo } from '../seo-pages/DoctorProfileSeo';
import { ReviewList } from '../components/reviews/ReviewList';
import { ReviewForm } from '../components/reviews/ReviewForm';

interface DoctorProfilePageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function DoctorProfilePage({ onNavigate }: { onNavigate: (page: string, data?: any) => void }) {
  const { doctorId } = useParams();
  const { doctors, loading } = useData();
  const doctor = doctors.find(d => d.id === doctorId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Doctor not found</p>
            <Button onClick={() => onNavigate('doctors')} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              Back to Doctors
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          onClick={() => onNavigate('doctors')}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Doctors
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Doctor Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Card */}
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Doctor Image */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-48 h-48 rounded-2xl object-cover border-4 border-white shadow-xl"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white"></div>
                    </div>
                  </div>

                  {/* Doctor Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-gray-900 mb-2">{doctor.name}</h1>
                        <p className="text-amber-600 text-xl mb-2">{doctor.specialty}</p>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                            <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                            {doctor.rating} Rating
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                            {doctor.experience} Years Experience
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg">
                          <GraduationCap className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Qualifications</p>
                          <p className="text-sm text-gray-900">{doctor.degrees}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg">
                          <MapPin className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm text-gray-900">{doctor.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg">
                          <Phone className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm text-gray-900">+880 1700-000000</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-lg">
                          <Mail className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm text-gray-900">doctor@jeevita.com</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Consultation Fee</p>
                      <p className="text-2xl text-amber-600">৳{doctor.fee}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>About Doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {doctor.name} is a highly experienced {doctor.specialty} with {doctor.experience} years of practice.
                  Graduated with {doctor.degrees}, they have been serving patients with dedication and excellence.
                  Their expertise includes comprehensive patient care, accurate diagnosis, and personalized treatment plans.
                  Patients appreciate their compassionate approach and thorough explanations of medical conditions.
                </p>
              </CardContent>
            </Card>

            {/* Specializations */}
            <Card>
              <CardHeader>
                <CardTitle>Specializations & Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['General Consultation', 'Health Checkup', 'Preventive Care', 'Treatment Planning', 'Follow-up Care', 'Emergency Care'].map((service, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700">{service}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Patient Reviews</CardTitle>
                <div className="flex gap-2">
                  <ReviewForm targetId={doctor.id} targetType="doctor" onSuccess={() => window.location.reload()} />
                </div>
              </CardHeader>
              <CardContent>
                <ReviewList targetId={doctor.id} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Book Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Available Time Slots</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors text-sm"
                      >
                        <Clock className="h-3 w-3 inline mr-1" />
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => onNavigate('booking', { doctorId: doctor.id })}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  size="lg"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Appointment
                </Button>

                <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Available Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Fast Response</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span>Verified Doctor</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
