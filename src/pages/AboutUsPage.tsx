import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Heart, Users, Award, Target, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';

interface AboutUsPageProps {
  onNavigate: (page: string) => void;
}

export function AboutUsPage({ onNavigate }: AboutUsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100/20 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-4 rounded-2xl shadow-lg">
              <Heart className="h-10 w-10 text-white fill-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              About Jeevita
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted healthcare partner in Bangladesh, connecting patients with quality medical services
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-8 border-2 border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6 text-amber-600" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed text-lg">
              At Jeevita, we are committed to making quality healthcare accessible to everyone in Bangladesh. 
              Our mission is to bridge the gap between patients and healthcare providers by offering a comprehensive 
              platform that connects you with experienced doctors, reliable pharmacies, and trusted hospitals.
            </p>
          </CardContent>
        </Card>

        {/* Vision Section */}
        <Card className="mb-8 border-2 border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Award className="h-6 w-6 text-amber-600" />
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed text-lg">
              We envision a future where healthcare is not just accessible, but also convenient, affordable, and 
              personalized. Through innovative technology and compassionate service, we aim to transform the healthcare 
              experience for millions of people across Bangladesh.
            </p>
          </CardContent>
        </Card>

        {/* What We Offer */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-amber-200 hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-600" />
                  Find Doctors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect with qualified doctors across various specialties. Book appointments online and get 
                  expert medical consultation at your convenience.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-amber-600" />
                  Order Medicines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Order prescription medicines online with home delivery. Upload your prescription and get 
                  authentic medicines delivered to your doorstep.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  Hospital Directory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Explore our comprehensive directory of hospitals and healthcare facilities. Find the right 
                  hospital for your medical needs with detailed information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Information */}
        <Card className="border-2 border-amber-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-lg">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 font-medium">jeevita.org@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-lg">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900 font-medium">01625691878</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900 font-medium">Dhaka, Bangladesh</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button
                onClick={() => onNavigate('contact')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

