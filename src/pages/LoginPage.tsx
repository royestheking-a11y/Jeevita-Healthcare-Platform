import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Heart, Mail, Lock, ArrowRight, Sparkles, Shield, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { OTPInput } from '../components/OTPInput';
import { generateOTP, sendPasswordResetOTP, storeOTP, verifyOTP, clearOTP } from '../utils/emailService';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { LoginSeo } from '../seo-pages/LoginSeo';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'otp' | 'new-password'>('email');
  const [resetOTPSent, setResetOTPSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Start resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
      onNavigate('home');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const otp = generateOTP();
      const sent = await sendPasswordResetOTP(resetEmail, otp);

      if (sent) {
        storeOTP(resetEmail, otp, 'password-reset');
        setResetOTPSent(true);
        setResetStep('otp');
        setResendTimer(60);
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
    const isValid = verifyOTP(resetEmail, enteredOTP, 'password-reset');

    if (isValid) {
      toast.success('OTP verified! Please set your new password.');
      setResetStep('new-password');
    } else {
      toast.error('Invalid OTP. Please try again.');
    }
  };

  const handleResendResetOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    try {
      const otp = generateOTP();
      const sent = await sendPasswordResetOTP(resetEmail, otp);

      if (sent) {
        storeOTP(resetEmail, otp, 'password-reset');
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

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long!');
      return;
    }

    setLoading(true);
    try {
      // Load users from localStorage
      const allUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
      const userIndex = allUsers.findIndex((u: any) => u.email === resetEmail);

      if (userIndex === -1) {
        toast.error('User not found!');
        return;
      }

      // Update password
      allUsers[userIndex].password = newPassword;
      localStorage.setItem('pendingUsers', JSON.stringify(allUsers));

      clearOTP(resetEmail, 'password-reset');
      toast.success('Password reset successfully! You can now login.');
      setShowResetDialog(false);
      setResetStep('email');
      setResetEmail('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      toast.error('Failed to reset password. Please try again.');
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

          <div className="text-center mb-8">
            <h2 className="text-gray-900 mb-2 flex items-center justify-center gap-2">
              Welcome Back
              <Sparkles className="h-6 w-6 text-amber-500" />
            </h2>
            <p className="text-gray-600">
              Sign in to access your healthcare dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30 text-white"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => {
                setShowResetDialog(true);
                setResetEmail(email);
              }}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium hover:underline"
            >
              Forgot Password?
            </button>
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('signup')}
                className="text-amber-600 hover:text-amber-700 font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Password Reset Dialog */}
          <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-amber-600" />
                  Reset Password
                </DialogTitle>
                <DialogDescription>
                  {resetStep === 'email' && 'Enter your email address to receive a password reset OTP'}
                  {resetStep === 'otp' && 'Enter the OTP sent to your email'}
                  {resetStep === 'new-password' && 'Set your new password'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {resetStep === 'email' && (
                  <>
                    <div>
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={handleResetPassword}
                      disabled={loading || !resetEmail}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </Button>
                  </>
                )}

                {resetStep === 'otp' && (
                  <>
                    <div>
                      <Label className="text-center block mb-4">Enter OTP</Label>
                      <OTPInput
                        length={6}
                        onComplete={handleOTPComplete}
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        OTP sent to <strong>{resetEmail}</strong>
                      </p>
                    </div>
                    <div className="text-center">
                      <button
                        onClick={handleResendResetOTP}
                        disabled={resendTimer > 0 || loading}
                        className="text-sm text-amber-600 hover:text-amber-700 font-medium hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                      </button>
                    </div>
                    <Button
                      onClick={() => {
                        setResetStep('email');
                        setResetOTPSent(false);
                        clearOTP(resetEmail, 'password-reset');
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  </>
                )}

                {resetStep === 'new-password' && (
                  <>
                    <div>
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Confirm New Password</Label>
                      <Input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={handleUpdatePassword}
                      disabled={loading || !newPassword || !confirmNewPassword}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
