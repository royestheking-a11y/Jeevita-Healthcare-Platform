import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, Scale, AlertTriangle, CheckCircle, XCircle, BookOpen } from 'lucide-react';

interface TermsOfServicePageProps {
  onNavigate: (page: string) => void;
}

export function TermsOfServicePage({ onNavigate }: TermsOfServicePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100/20 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-4 rounded-2xl shadow-lg">
              <Scale className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Terms of Service
            </h1>
          </div>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <Card className="border-2 border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-600" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Jeevita's healthcare platform, you agree to be bound by these Terms of Service. 
                If you do not agree with any part of these terms, you may not access or use our services.
              </p>
            </CardContent>
          </Card>

          {/* Use of Service */}
          <Card className="border-2 border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-amber-600" />
                Use of Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Eligibility</h3>
                  <p className="text-gray-700">
                    You must be at least 18 years old to use our services. By using Jeevita, you represent and warrant 
                    that you meet this age requirement.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Account Responsibility</h3>
                  <p className="text-gray-700">
                    You are responsible for maintaining the confidentiality of your account credentials and for all 
                    activities that occur under your account.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Acceptable Use</h3>
                  <p className="text-gray-700 mb-2">You agree not to:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Use the service for any illegal or unauthorized purpose</li>
                    <li>Violate any laws or regulations</li>
                    <li>Interfere with or disrupt the service</li>
                    <li>Attempt to gain unauthorized access to any part of the platform</li>
                    <li>Share false or misleading information</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Services */}
          <Card className="border-2 border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                Medical Services Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 mb-1">Important Notice</p>
                      <p className="text-amber-800 text-sm">
                        Jeevita is a platform that connects patients with healthcare providers. We do not provide 
                        medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals 
                        for medical concerns.
                      </p>
                    </div>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Jeevita does not replace professional medical consultation</li>
                  <li>Information provided on the platform is for informational purposes only</li>
                  <li>Always seek professional medical advice for health concerns</li>
                  <li>In case of medical emergencies, contact emergency services immediately</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payments and Refunds */}
          <Card className="border-2 border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-amber-600" />
                Payments and Refunds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Payment Terms</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>All payments must be made through approved payment methods</li>
                    <li>Prices are subject to change without prior notice</li>
                    <li>You are responsible for all charges incurred under your account</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Refund Policy</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>Refund requests must be submitted within 7 days of purchase</li>
                    <li>Refunds are subject to review and approval</li>
                    <li>Processing fees may apply to refunds</li>
                    <li>Refunds will be processed to the original payment method</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="border-2 border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-amber-600" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                To the maximum extent permitted by law, Jeevita shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Loss of profits or revenue</li>
                <li>Loss of data or information</li>
                <li>Service interruptions or errors</li>
                <li>Any damages resulting from use or inability to use the service</li>
              </ul>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="border-2 border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. We will notify users of any 
                material changes by posting the updated terms on our platform. Your continued use of the service 
                after such changes constitutes acceptance of the new terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-2 border-amber-200 shadow-lg">
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> jeevita.org@gmail.com</p>
                <p><strong>Phone:</strong> 01625691878</p>
                <p><strong>Address:</strong> Dhaka, Bangladesh</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

