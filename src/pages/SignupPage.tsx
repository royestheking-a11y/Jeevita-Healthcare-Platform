import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Heart, User, Mail, Lock, Sparkles, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { OTPInput } from '../components/OTPInput';
import { generateOTP, sendRegistrationOTP, storeOTP, verifyOTP, clearOTP } from '../utils/emailService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

interface SignupPageProps {
  onNavigate: (page: string) => void;
}

import { SignupSeo } from '../seo-pages/SignupSeo';

export function SignupPage({ onNavigate }: SignupPageProps) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Start resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long!');
      return;
    }

    setLoading(true);

    try {
      // Generate and send OTP
      const otp = generateOTP();
      const sent = await sendRegistrationOTP(email, otp);

      if (sent) {
        storeOTP(email, otp, 'registration');
        setOtpSent(true);
        setStep('otp');
        setResendTimer(60); // 60 seconds cooldown
        toast.success('OTP sent to your email! Please check your inbox.');
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = async (enteredOTP: string) => {
    const isValid = verifyOTP(email, enteredOTP, 'registration');

    if (isValid) {
      setOtpVerified(true);
      toast.success('Email verified! Creating your account...');

      // Now create the account
      try {
        await signup(name, email, password);
        clearOTP(email, 'registration');
        toast.success('Account created successfully! You can now login.');
        onNavigate('login');
      } catch (error) {
        toast.error('Signup failed. Please try again.');
        setOtpVerified(false);
        setStep('form');
      }
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    try {
      const otp = generateOTP();
      const sent = await sendRegistrationOTP(email, otp);

      if (sent) {
        storeOTP(email, otp, 'registration');
        setResendTimer(60);
        toast.success('OTP resent to your email!');
      } else {
        toast.error('Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-grid-amber-100 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-amber-500/20 p-8 border border-amber-200">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-3 rounded-xl shadow-lg">
                <Heart className="h-8 w-8 text-white fill-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
                Jeevita
              </span>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-gray-900 mb-2 flex items-center justify-center gap-2">
              Create Account
              <Sparkles className="h-6 w-6 text-amber-500" />
            </h2>
            <p className="text-gray-600">
              Join Jeevita for better healthcare
            </p>
          </div>

          {step === 'form' ? (
            <>
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-10 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => onNavigate('login')}
                    className="text-amber-600 hover:text-amber-700 font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-4 rounded-full">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Your Email</h3>
                <p className="text-gray-600">
                  We've sent a 6-digit OTP to <strong>{email}</strong>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Please check your inbox and enter the OTP below
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-center block mb-4">Enter OTP</Label>
                  <OTPInput
                    length={6}
                    onComplete={handleOTPComplete}
                    disabled={otpVerified || loading}
                  />
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Didn't receive the OTP?{' '}
                    <button
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0 || loading}
                      className="text-amber-600 hover:text-amber-700 font-medium hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setStep('form');
                    setOtpSent(false);
                    clearOTP(email, 'registration');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Form
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
