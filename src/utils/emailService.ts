import emailjs from '@emailjs/browser';

// EmailJS Configuration
const SERVICE_ID = 'service_yurahbn';
const PUBLIC_KEY = 'X3qeQyycFUmnhZGli';
const REGISTRATION_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_REGISTRATION_TEMPLATE_ID || 'template_4kemkwm';
const PASSWORD_RESET_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_RESET_TEMPLATE_ID || 'template_0kp2of2';

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP for registration
export async function sendRegistrationOTP(email: string, otp: string): Promise<boolean> {
  try {
    // Calculate expiration time (5 minutes from now)
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000);
    const timeString = expirationTime.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    // EmailJS template parameters - matching your template variables
    const templateParams: Record<string, string> = {
      // Recipient email (set in EmailJS template settings)
      to_email: email,
      user_email: email,
      email: email,
      // Template variables from your template
      passcode: otp, // Your template uses {{passcode}}
      time: timeString, // Your template uses {{time}}
      // Additional fallback variables
      otp: otp,
      otp_code: otp,
      code: otp,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      REGISTRATION_TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    console.log('EmailJS Response:', response);
    return true;
  } catch (error: any) {
    console.error('Error sending registration OTP:', error);
    // Log more details about the error
    if (error.text) {
      console.error('EmailJS Error Details:', error.text);
    }
    if (error.status) {
      console.error('EmailJS Status:', error.status);
    }
    return false;
  }
}

// Send OTP for password reset
export async function sendPasswordResetOTP(email: string, otp: string): Promise<boolean> {
  try {
    // Calculate expiration time (5 minutes from now)
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000);
    const timeString = expirationTime.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    // EmailJS template parameters - matching your template variables
    const templateParams: Record<string, string> = {
      // Recipient email (set in EmailJS template settings)
      to_email: email,
      user_email: email,
      email: email,
      // Template variables from your template
      passcode: otp, // Your template uses {{passcode}}
      time: timeString, // Your template uses {{time}}
      // Additional fallback variables
      otp: otp,
      otp_code: otp,
      code: otp,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      PASSWORD_RESET_TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    console.log('EmailJS Response:', response);
    return true;
  } catch (error: any) {
    console.error('Error sending password reset OTP:', error);
    // Log more details about the error
    if (error.text) {
      console.error('EmailJS Error Details:', error.text);
    }
    if (error.status) {
      console.error('EmailJS Status:', error.status);
    }
    return false;
  }
}

// Store OTP in localStorage with expiration (5 minutes)
export function storeOTP(email: string, otp: string, type: 'registration' | 'password-reset'): void {
  const otpData = {
    otp,
    email,
    type,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  };
  localStorage.setItem(`otp_${email}_${type}`, JSON.stringify(otpData));
}

// Verify OTP
export function verifyOTP(email: string, enteredOTP: string, type: 'registration' | 'password-reset'): boolean {
  const storedData = localStorage.getItem(`otp_${email}_${type}`);
  if (!storedData) {
    return false;
  }

  try {
    const otpData = JSON.parse(storedData);

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      localStorage.removeItem(`otp_${email}_${type}`);
      return false;
    }

    // Verify OTP
    if (otpData.otp === enteredOTP && otpData.email === email) {
      localStorage.removeItem(`otp_${email}_${type}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
}

// Clear OTP
export function clearOTP(email: string, type: 'registration' | 'password-reset'): void {
  localStorage.removeItem(`otp_${email}_${type}`);
}

