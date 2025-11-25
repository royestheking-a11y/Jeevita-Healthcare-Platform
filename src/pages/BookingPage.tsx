import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Calendar } from '../components/ui/calendar';
import { toast } from 'sonner';

interface BookingPageProps {
  doctorId: string;
  onNavigate: (page: string, data?: any) => void;
}

export function BookingPage({ doctorId, onNavigate }: BookingPageProps) {
  const { doctors, addAppointment, loading } = useData();
  const { user } = useAuth();
  const doctor = doctors.find(d => d.id === doctorId);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [consultType, setConsultType] = useState('in-person');

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
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xl text-gray-600 mb-4">Doctor not found</p>
          <Button onClick={() => onNavigate('doctors')} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            Back to Doctors
          </Button>
        </div>
      </div>
    );
  }

  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time');
      return;
    }

    if (!user) {
      toast.error('Please login to book an appointment');
      onNavigate('login');
      return;
    }

    // Navigate to payment page for bKash payment
    onNavigate('payment', {
      type: 'appointment',
      doctor,
      date: selectedDate,
      time: selectedTime,
      consultType,
      amount: doctor.fee,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-gray-900 mb-8">Book Appointment</h1>

        <div className="bg-white rounded-2xl shadow-xl shadow-amber-500/10 border border-amber-200 p-6 mb-6">
          {/* Doctor Info */}
          <div className="flex gap-4 mb-6 pb-6 border-b border-amber-200">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-amber-100"
            />
            <div>
              <h3 className="text-gray-900">{doctor.name}</h3>
              <p className="text-amber-600">{doctor.specialty}</p>
              <p className="text-sm text-gray-600">{doctor.degrees}</p>
              <p className="text-sm text-gray-600 mt-1">
                📍 {doctor.location}
              </p>
            </div>
          </div>

          {/* Consultation Type */}
          <div className="mb-6">
            <Label className="mb-3 block">Consultation Type</Label>
            <RadioGroup value={consultType} onValueChange={setConsultType}>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="in-person" id="in-person" />
                <Label htmlFor="in-person" className="cursor-pointer">
                  In-Person Visit
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="cursor-pointer">
                  Online Consultation
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date Selection */}
          <div className="mb-6">
            <Label className="mb-3 block">Select Date</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
          </div>

          {/* Time Selection */}
          <div className="mb-6">
            <Label className="mb-3 block">Select Time Slot</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a time slot" />
              </SelectTrigger>
              <SelectContent>
                {doctor.timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fee Display */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-xl mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Consultation Fee:</span>
              <span className="text-2xl text-amber-600">৳{doctor.fee}</span>
            </div>
            <p className="text-xs text-amber-700 mt-2 font-medium">
              Payment required via bKash. Appointment will be confirmed after payment verification.
            </p>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={handleBookAppointment}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
          >
            Proceed to Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
