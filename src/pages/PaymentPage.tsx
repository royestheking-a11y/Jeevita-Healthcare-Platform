import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle, Clock, CreditCard, Wallet, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import bkashQR from '../assets/2e2d5a2c1148a6b9f95f31dbeaea93375e3f38ed.png';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Badge } from '../components/ui/badge';
import { NotificationService } from '../utils/notifications';

interface PaymentPageProps {
  paymentData: {
    type: 'appointment' | 'medicine';
    amount: number;
    deliveryFee?: number;
    address?: any;
    items?: any[];
    [key: string]: any;
  };
  onNavigate: (page: string) => void;
}

export function PaymentPage(props: any) {
  const { onNavigate } = props;
  // Handle both nested paymentData (if passed that way) or flattened props (from PageWrapper spread)
  const paymentData = props.paymentData || props;

  const { addPayment, addAppointment } = useData();
  const { user } = useAuth();
  const { clearCart } = useCart();

  // Handle missing payment data (check if essential fields are missing)
  if (!paymentData || (!paymentData.amount && !paymentData.items)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Session Expired</h2>
            <p className="text-gray-600 mb-6">
              Your payment session has expired. Please start the process again.
            </p>
            <Button
              onClick={() => onNavigate('home')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>(() => {
    // For appointments, default to bKash only
    return paymentData.type === 'appointment' ? 'bkash' : 'cod';
  });
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (isSubmitted && paymentMethod === 'bkash' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isSubmitted, paymentMethod, timeLeft]);

  // Scroll to top when submitted
  useEffect(() => {
    if (isSubmitted) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isSubmitted]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCashOnDelivery = () => {
    const userName = user?.name || paymentData.guestInfo?.name || 'Guest User';
    const userEmail = user?.email || paymentData.guestInfo?.email || 'guest@example.com';
    const orderId = `ORD${Date.now()}`;

    setIsProcessing(true);

    // Add payment with COD status (automatically processing)
    addPayment({
      user: userName,
      userEmail: userEmail,
      type: paymentData.type,
      amount: paymentData.amount,
      transactionId: `COD-${orderId}`,
      status: 'verified', // COD orders go directly to processing
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toLocaleString(),
      orderId: paymentData.type === 'medicine' ? orderId : undefined,
      paymentMethod: 'cod',
      address: paymentData.address || paymentData.guestInfo?.address,
      items: paymentData.items || [],
      deliveryFee: paymentData.deliveryFee || 0,
      orderStatus: paymentData.type === 'medicine' ? 'confirmed' : undefined, // COD medicine orders are confirmed
    });

    // Clear cart if it's a medicine order
    if (paymentData.type === 'medicine') {
      clearCart();
    }

    setTimeout(() => {
      setIsProcessing(false);
      setIsSubmitted(true);
      toast.success('Order placed successfully! Your order is now processing.');

      // Send notification for COD orders
      if (paymentData.type === 'medicine') {
        NotificationService.notifyOrderConfirmed(orderId, paymentData.amount);
      }
    }, 1500);
  };

  const handleBkashPayment = () => {
    if (!transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    const userName = user?.name || paymentData.guestInfo?.name || 'Guest User';
    const userEmail = user?.email || paymentData.guestInfo?.email || 'guest@example.com';
    const orderId = `ORD${Date.now()}`;

    // Add payment with pending status (needs verification)
    addPayment({
      user: userName,
      userEmail: userEmail,
      type: paymentData.type,
      amount: paymentData.amount,
      transactionId: transactionId.trim(),
      status: 'pending', // bKash payments need verification
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toLocaleString(),
      orderId: paymentData.type === 'medicine' ? orderId : undefined,
      paymentMethod: 'bkash',
      address: paymentData.address || paymentData.guestInfo?.address,
      items: paymentData.items || [],
      deliveryFee: paymentData.deliveryFee || 0,
      orderStatus: paymentData.type === 'medicine' ? 'pending' : undefined, // bKash medicine orders are pending
    });

    // If it's an appointment, create appointment record with pending status (will be confirmed after admin verification)
    if (paymentData.type === 'appointment' && paymentData.doctor) {
      addAppointment({
        patientName: userName,
        patientEmail: userEmail,
        doctorId: paymentData.doctor.id,
        doctorName: paymentData.doctor.name,
        specialty: paymentData.doctor.specialty,
        date: paymentData.date ? (paymentData.date instanceof Date ? paymentData.date.toISOString().split('T')[0] : paymentData.date) : new Date().toISOString().split('T')[0],
        time: paymentData.time || '10:00 AM',
        status: 'pending', // Will be confirmed after payment verification
        amount: paymentData.amount,
        transactionId: transactionId.trim(),
        consultType: paymentData.consultType || 'in-person',
      });
    }

    setIsSubmitted(true);
    toast.success('Payment submitted! Waiting for admin verification...');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50/30 py-8 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-gray-900 mb-2">Processing Order...</h2>
            <p className="text-gray-600">Please wait while we process your order</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50/30 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-amber-200">
            <CardContent className="p-8 text-center">
              {paymentMethod === 'cod' ? (
                <>
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
                  <p className="text-gray-600 mb-6">
                    Your order is now processing. You'll receive a confirmation call shortly.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-amber-800">
                      <strong>Payment Method:</strong> Cash on Delivery
                    </p>
                    <p className="text-sm text-amber-800 mt-1">
                      Please keep exact change ready for the delivery person.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4 animate-pulse" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h2>
                    <p className="text-gray-600 mb-4">
                      Our admin team is verifying your payment. This usually takes a few minutes.
                    </p>
                    <div className="inline-block bg-gradient-to-r from-amber-50 to-orange-50 text-amber-600 border border-amber-200 px-4 py-2 rounded-lg">
                      <p>Time remaining: {formatTime(timeLeft)}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h4 className="text-gray-900 mb-4">Payment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="text-gray-900 font-mono">{transactionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="text-gray-900">৳{paymentData.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="text-gray-900 capitalize">
                          {paymentData.type === 'appointment' ? 'Doctor Appointment' : 'Medicine Order'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    You will receive a confirmation email once payment is verified.
                  </p>
                </>
              )}

              <Button
                onClick={() => {
                  if (paymentData.type === 'medicine') {
                    onNavigate('dashboard');
                  } else {
                    onNavigate('dashboard');
                  }
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const subtotal = paymentData.amount - (paymentData.deliveryFee || 0);
  const deliveryFee = paymentData.deliveryFee || 0;

  // For appointments, only allow bKash payment
  if (paymentData.type === 'appointment') {
    // Set payment method to bKash only for appointments
    if (paymentMethod !== 'bkash') {
      setPaymentMethod('bkash');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50/30 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Complete Payment
          </h1>
          <p className="text-gray-600">Choose your payment method and complete the order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Method Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Summary */}
            <Card className="border-2 border-amber-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {paymentData.items && paymentData.items.length > 0 && (
                    <div className="space-y-2">
                      {paymentData.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.name} x{item.quantity}</span>
                          <span className="text-gray-900">৳{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900 font-semibold">৳{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="text-gray-900 font-semibold">৳{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t-2 border-amber-200">
                      <span className="text-lg font-bold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        ৳{paymentData.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            {(paymentData.address || paymentData.guestInfo?.address) && (
              <Card className="border-2 border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-amber-600" />
                    <h3 className="text-xl font-bold text-gray-900">Delivery Address</h3>
                  </div>
                  {paymentData.address ? (
                    <div>
                      <p className="text-gray-900 font-medium">{paymentData.address.street}</p>
                      <p className="text-gray-600">
                        {paymentData.address.city}, {paymentData.address.district} - {paymentData.address.postalCode}
                      </p>
                      <p className="text-gray-600">Phone: {paymentData.address.phone}</p>
                    </div>
                  ) : (
                    <p className="text-gray-900">{paymentData.guestInfo?.address}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payment Method Selection */}
            <Card className="border-2 border-amber-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Select Payment Method</h3>
                <div className="space-y-4">
                  {/* Cash on Delivery - Only for medicine orders */}
                  {paymentData.type === 'medicine' && (
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-amber-300'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg ${paymentMethod === 'cod' ? 'bg-amber-500' : 'bg-gray-100'}`}>
                            <Wallet className={`h-6 w-6 ${paymentMethod === 'cod' ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">Cash on Delivery</h4>
                            <p className="text-sm text-gray-600">Pay when you receive your order</p>
                          </div>
                        </div>
                        {paymentMethod === 'cod' && (
                          <div className="bg-amber-500 text-white rounded-full p-1">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>✓ Instant Processing:</strong> Your order will be processed immediately
                        </p>
                      </div>
                    </div>
                  )}

                  {/* bKash Payment */}
                  <div
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'bkash'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${paymentMethod === 'bkash' ? 'bg-pink-500' : 'bg-gray-100'}`}>
                          <CreditCard className={`h-6 w-6 ${paymentMethod === 'bkash' ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">bKash / Nagad</h4>
                          <p className="text-sm text-gray-600">Pay via mobile banking</p>
                        </div>
                      </div>
                      {paymentMethod === 'bkash' && (
                        <div className="bg-amber-500 text-white rounded-full p-1">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>⏱ Verification Required:</strong> Order will process after payment verification
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* bKash Payment Instructions */}
            {paymentMethod === 'bkash' && (
              <Card className="border-2 border-pink-200 bg-pink-50/30">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">bKash Payment Instructions</h3>

                  <div className="bg-white border border-pink-200 rounded-lg p-6 mb-4">
                    <div className="flex flex-col items-center">
                      <img
                        src={bkashQR}
                        alt="bKash QR Code"
                        className="w-64 h-64 mb-4"
                      />
                      <p className="text-center mb-2">
                        <strong>bKash Number:</strong> 01625691878
                      </p>
                      <p className="text-sm text-gray-600 text-center">
                        Scan the QR code or send money to this number
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <h4 className="text-gray-900 mb-2 font-semibold">Steps:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                      <li>Open your bKash/Nagad app</li>
                      <li>Send ৳{paymentData.amount.toFixed(2)} to 01625691878</li>
                      <li>Copy the transaction ID</li>
                      <li>Enter the transaction ID below</li>
                      <li>Click "I've Paid - Verify Now"</li>
                    </ol>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="transactionId">Transaction ID *</Label>
                      <Input
                        id="transactionId"
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter bKash/Nagad transaction ID"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter the transaction ID you received after sending the payment
                      </p>
                    </div>

                    <Button
                      onClick={handleBkashPayment}
                      disabled={!transactionId.trim()}
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      I've Paid - Verify Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cash on Delivery Confirmation - Only for medicine orders */}
            {paymentMethod === 'cod' && paymentData.type === 'medicine' && (
              <Card className="border-2 border-green-200 bg-green-50/30">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Cash on Delivery</h3>
                  <div className="space-y-4">
                    <div className="bg-white border border-green-200 rounded-lg p-4">
                      <p className="text-gray-700 mb-2">
                        <strong>How it works:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        <li>Your order will be processed immediately</li>
                        <li>You'll receive a confirmation call within 30 minutes</li>
                        <li>Pay the exact amount (৳{paymentData.amount.toFixed(2)}) when you receive your order</li>
                        <li>Delivery within 24-48 hours</li>
                      </ul>
                    </div>

                    <Button
                      onClick={handleCashOnDelivery}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30 text-lg py-6"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Confirm Order (Cash on Delivery)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-amber-200 sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-semibold">৳{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-gray-900 font-semibold">৳{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-amber-200 pt-3 flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      ৳{paymentData.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Badge className={`w-full justify-center py-2 ${paymentMethod === 'cod'
                    ? 'bg-green-500'
                    : 'bg-pink-500'
                    }`}>
                    {paymentMethod === 'cod' ? 'Cash on Delivery' : 'bKash Payment'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
