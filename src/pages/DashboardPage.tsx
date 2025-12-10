import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Calendar, Package, User, Clock, MapPin, Settings,
  FileText, Camera, Plus, LogOut,
  RotateCcw, Edit, Trash2, Upload, X
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { NotificationService } from '../utils/notifications';
import { ImageUploadWithCrop } from '../components/ImageUploadWithCrop';
import { refundsAPI } from '../utils/api';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { payments, appointments: allAppointments, prescriptions, addPrescription } = useData();
  const [activeTab, setActiveTab] = useState(section || 'profile');
  const [showPrescriptionUploadDialog, setShowPrescriptionUploadDialog] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState<string>('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    () => ('Notification' in window ? Notification.permission : 'denied')
  );
  const [profileImage, setProfileImage] = useState<string>(() => {
    return user?.profileImage || '';
  });

  // Load addresses from user profile
  const [addresses, setAddresses] = useState<any[]>(() => {
    return user?.addresses || [];
  });

  const [newAddress, setNewAddress] = useState({
    type: 'Home',
    street: '',
    city: '',
    district: '',
    postalCode: '',
    phone: ''
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showProfilePhotoDialog, setShowProfilePhotoDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    bio: ''
  });

  // Sync activeTab with URL parameter
  useEffect(() => {
    if (section) {
      setActiveTab(section);
    }
  }, [section]);

  // Helper function to navigate to dashboard section
  const navigateToSection = (sectionName: string) => {
    setActiveTab(sectionName);
    navigate(`/dashboard/${sectionName}`);
  };

  // Load profile data when user is available
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        bio: user.bio || ''
      });
      setProfileImage(user.profileImage || '');
      setAddresses(user.addresses || []);
    }
  }, [user]);



  // Save profile data to backend
  const handleSaveProfile = () => {
    if (user) {
      updateUser(profileData);
      toast.success('Profile updated successfully!');
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if (user && user.role !== 'admin') {
      NotificationService.requestPermission().then((granted) => {
        if (granted) {
          setNotificationPermission('granted');
        } else {
          setNotificationPermission(Notification.permission);
        }
      });
    }
  }, [user]);

  // Update permission state when it changes
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Listen for prescription approval notifications
  useEffect(() => {
    if (user) {
      const userPrescriptions = prescriptions.filter(p => p.userId === user.id);
      const approvedPrescription = userPrescriptions.find(p => p.status === 'approved');

      if (approvedPrescription) {
        // Check if we've already notified for this prescription
        const notifiedKey = `prescription-notified-${approvedPrescription.id}`;
        if (!localStorage.getItem(notifiedKey)) {
          NotificationService.notifyPrescriptionReady(user.name);
          localStorage.setItem(notifiedKey, 'true');
        }
      }
    }
  }, [prescriptions, user]);

  // Listen for order status changes
  useEffect(() => {
    if (user) {
      const userOrders = payments.filter(p =>
        p.type === 'medicine' &&
        (p.userEmail === user.email || p.user === user.name)
      );

      userOrders.forEach(order => {
        const orderId = order.orderId || order.id;

        // Check for shipped status
        if (order.orderStatus === 'shipped') {
          const notifiedKey = `order-shipped-${orderId}`;
          if (!localStorage.getItem(notifiedKey)) {
            NotificationService.notifyOrderShipped(orderId);
            localStorage.setItem(notifiedKey, 'true');
          }
        }

        // Check for delivered status
        if (order.orderStatus === 'delivered') {
          const notifiedKey = `order-delivered-${orderId}`;
          if (!localStorage.getItem(notifiedKey)) {
            NotificationService.notifyOrderDelivered(orderId);
            localStorage.setItem(notifiedKey, 'true');
          }
        }
      });
    }
  }, [payments, user]);

  // Listen for appointment confirmations
  useEffect(() => {
    if (user) {
      const userAppointments = allAppointments.filter(a =>
        a.patientEmail === user.email || a.patientName === user.name
      );

      userAppointments.forEach(appointment => {
        if (appointment.status === 'confirmed') {
          const notifiedKey = `appointment-confirmed-${appointment.id}`;
          if (!localStorage.getItem(notifiedKey)) {
            NotificationService.notifyAppointmentConfirmed(
              appointment.doctorName,
              appointment.date,
              appointment.time
            );
            localStorage.setItem(notifiedKey, 'true');
          }
        }
      });
    }
  }, [allAppointments, user]);

  // Helper function to sort items: Pending first, then by date (newest first)
  const sortByStatusAndDate = (a: any, b: any) => {
    const isAPending = a.status === 'pending' || a.status === 'processing';
    const isBPending = b.status === 'pending' || b.status === 'processing';

    if (isAPending && !isBPending) return -1;
    if (!isAPending && isBPending) return 1;

    return new Date(b.date).getTime() - new Date(a.date).getTime();
  };

  // Load orders from payments (medicine orders)
  const orders = payments
    .filter(p => p.type === 'medicine' && (p.userEmail === user?.email || p.user === user?.name))
    .map(payment => {
      // Use orderStatus if available, otherwise derive from status
      let orderStatus = payment.orderStatus;
      if (!orderStatus) {
        // Fallback: derive from payment status
        if (payment.status === 'verified') {
          orderStatus = 'confirmed';
        } else if (payment.status === 'pending') {
          orderStatus = 'pending';
        } else if (payment.status === 'rejected') {
          orderStatus = 'rejected';
        } else {
          orderStatus = 'confirmed';
        }
      }

      // Map orderStatus to display status
      // Keep shipped and delivered as-is, map confirmed to processing
      let displayStatus: string = orderStatus || 'pending';
      if (orderStatus === 'confirmed') {
        displayStatus = 'processing';
      } else if (orderStatus === 'shipped') {
        displayStatus = 'shipped';
      } else if (orderStatus === 'delivered') {
        displayStatus = 'delivered';
      } else if (orderStatus === 'rejected') {
        displayStatus = 'rejected';
      }

      return {
        id: payment.orderId || payment.id,
        items: payment.items?.map((item: any) => `${item.name} x${item.quantity}`) || ['Medicine Order'],
        total: payment.amount,
        status: displayStatus,
        orderStatus: orderStatus, // Keep original orderStatus for reference
        date: payment.date,
        address: typeof payment.address === 'string' ? payment.address :
          payment.address ? `${payment.address.street}, ${payment.address.city}` : 'N/A',
        canRefund: payment.status === 'verified' && orderStatus !== 'delivered',
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
      };
    })
    .sort(sortByStatusAndDate);

  // Load appointments for current user
  const appointments = allAppointments
    .filter(a => a.patientEmail === user?.email || a.patientName === user?.name)
    .map(apt => ({
      id: apt.id,
      doctor: apt.doctorName,
      specialty: apt.specialty,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      fee: apt.amount,
      consultType: apt.consultType,
    }))
    .sort(sortByStatusAndDate);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please login to view your dashboard</p>
          <Button onClick={() => onNavigate('login')} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            Login
          </Button>
        </div>
      </div>
    );
  }

  if (user.status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100/20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <CardTitle className="text-center">Account Pending Approval</CardTitle>
            <CardDescription className="text-center">
              Your account is waiting for admin approval. You'll receive an email once activated.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleProfileImageUpload = async (imageData: string) => {
    try {
      let imageUrl = imageData;
      // Upload to Cloudinary if it's a base64 image
      if (imageData.startsWith('data:')) {
        toast.info('Uploading photo...');
        imageUrl = await uploadToCloudinary(imageData, 'users');
      }
      setProfileImage(imageUrl);
      if (user) {
        updateUser({ profileImage: imageUrl });
      }
      toast.success('Profile photo updated!');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('Failed to upload photo. Please try again.');
    }
  };



  const handleAddAddress = () => {
    if (!newAddress.street || !newAddress.city || !newAddress.district || !newAddress.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    let updatedAddresses;
    if (editingAddress) {
      // Update existing address
      updatedAddresses = addresses.map(a => a.id === editingAddress.id ? { ...newAddress, id: editingAddress.id, isDefault: editingAddress.isDefault } : a);
      toast.success('Address updated successfully!');
      setEditingAddress(null);
    } else {
      // Add new address
      const address = {
        id: Date.now().toString(),
        ...newAddress,
        isDefault: addresses.length === 0
      };
      updatedAddresses = [...addresses, address];
      toast.success('Address added successfully!');
    }

    setAddresses(updatedAddresses);
    if (user) {
      updateUser({ addresses: updatedAddresses });
    }

    setNewAddress({ type: 'Home', street: '', city: '', district: '', postalCode: '', phone: '' });
    setShowAddressForm(false);
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setNewAddress({
      type: address.type,
      street: address.street,
      city: address.city,
      district: address.district,
      postalCode: address.postalCode,
      phone: address.phone
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (id: string) => {
    const updatedAddresses = addresses.filter(a => a.id !== id);
    setAddresses(updatedAddresses);
    if (user) {
      updateUser({ addresses: updatedAddresses });
    }
    toast.success('Address deleted');
  };

  const handleSetDefaultAddress = (id: string) => {
    const updatedAddresses = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    setAddresses(updatedAddresses);
    if (user) {
      updateUser({ addresses: updatedAddresses });
    }
    toast.success('Default address updated');
  };

  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [refundMethod, setRefundMethod] = useState('bkash');
  const [refundNumber, setRefundNumber] = useState('');

  const handleOpenRefundDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setRefundMethod('bkash');
    setRefundNumber('');
    setShowRefundDialog(true);
  };

  const handleRequestRefund = async () => {
    if (!selectedOrderId || !refundNumber) {
      toast.error('Please enter a refund number');
      return;
    }

    const order = orders.find(o => o.id === selectedOrderId);
    if (!order) {
      toast.error('Order not found');
      return;
    }

    try {
      const newRefundRequest = {
        userName: user?.name || 'User',
        orderType: 'Medicine Order',
        orderId: selectedOrderId,
        amount: order.total,
        reason: 'Customer request',
        status: 'pending',
        requestDate: new Date().toISOString().split('T')[0],
        transactionId: order.transactionId || '',
        refundMethod,
        refundNumber
      };

      await refundsAPI.create(newRefundRequest);
      toast.success('Refund request submitted. Admin will review shortly.');
      setShowRefundDialog(false);
    } catch (error) {
      console.error('Failed to submit refund request:', error);
      toast.error('Failed to submit refund request. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; text: string }> = {
      confirmed: { color: 'bg-blue-100 text-blue-700', text: 'Confirmed' },
      pending: { color: 'bg-amber-100 text-amber-700', text: 'Pending' },
      cancelled: { color: 'bg-red-100 text-red-700', text: 'Cancelled' },
      delivered: { color: 'bg-green-100 text-green-700', text: 'Delivered' },
      processing: { color: 'bg-blue-100 text-blue-700', text: 'Processing' },
      shipped: { color: 'bg-indigo-100 text-indigo-700', text: 'Shipped' },
      rejected: { color: 'bg-red-100 text-red-700', text: 'Rejected' },
    };

    const { color, text } = config[status] || { color: 'bg-gray-100 text-gray-700', text: status };
    return <Badge className={color}>{text}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-gray-900 mb-2">My Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}!</p>
            </div>
            {notificationPermission !== 'granted' && NotificationService.isSupported() && (
              <Button
                onClick={async () => {
                  const granted = await NotificationService.requestPermission();
                  setNotificationPermission(granted ? 'granted' : Notification.permission);
                  if (granted) {
                    toast.success('Notifications enabled! You will receive updates about your orders and appointments.');
                  } else {
                    toast.info('Please enable notifications in your browser settings to receive updates.');
                  }
                }}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <Clock className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <button
                    onClick={() => navigateToSection('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-amber-50 text-amber-600' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => navigateToSection('appointments')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'appointments' ? 'bg-amber-50 text-amber-600' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Appointments</span>
                  </button>
                  <button
                    onClick={() => navigateToSection('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-amber-50 text-amber-600' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <Package className="h-5 w-5" />
                    <span>Orders</span>
                  </button>
                  <button
                    onClick={() => navigateToSection('addresses')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'addresses' ? 'bg-amber-50 text-amber-600' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <MapPin className="h-5 w-5" />
                    <span>Addresses</span>
                  </button>
                  <button
                    onClick={() => navigateToSection('prescriptions')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'prescriptions' ? 'bg-amber-50 text-amber-600' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <FileText className="h-5 w-5" />
                    <span>Prescriptions</span>
                  </button>
                  <button
                    onClick={() => navigateToSection('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-amber-50 text-amber-600' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </button>
                  <Separator className="my-2" />
                  <button
                    onClick={() => {
                      logout();
                      onNavigate('home');
                      toast.success('Logged out successfully');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-red-50 text-red-600"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Manage your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Photo */}
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex items-center gap-6">
                      <div className="relative group cursor-pointer" onClick={() => setShowProfilePhotoDialog(true)}>
                        <Avatar className="h-24 w-24 ring-4 ring-amber-100 group-hover:ring-amber-300 transition-all">
                          <AvatarImage src={profileImage} />
                          <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-2xl">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-gray-900 mb-1">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Profile Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={user.email} className="mt-1" disabled />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Bio</Label>
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Appointments</CardTitle>
                    <CardDescription>View and manage your doctor appointments</CardDescription>
                  </CardHeader>
                </Card>
                {appointments.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-gray-900 mb-2">No appointments yet</h3>
                      <p className="text-gray-600 mb-6">
                        Book an appointment with a doctor to get started
                      </p>
                      <Button
                        onClick={() => onNavigate('doctors')}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        Find Doctors
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  appointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-gray-900 mb-1">{appointment.doctor}</h3>
                            <p className="text-sm text-gray-600">{appointment.specialty}</p>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Date</p>
                            <p className="text-gray-900">{appointment.date}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Time</p>
                            <p className="text-gray-900">{appointment.time}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Fee</p>
                            <p className="text-amber-600 font-semibold">৳{appointment.fee}</p>
                          </div>
                        </div>
                        {appointment.consultType && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-gray-500">Type: <span className="text-gray-700 capitalize">{appointment.consultType}</span></p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Orders</CardTitle>
                    <CardDescription>Track your medicine orders and request refunds</CardDescription>
                  </CardHeader>
                </Card>
                {orders.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600 mb-6">
                        Your medicine orders will appear here
                      </p>
                      <Button
                        onClick={() => onNavigate('medicines')}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        Browse Medicines
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-gray-900 mb-1">Order #{order.id}</h3>
                            <p className="text-sm text-gray-600">{order.date}</p>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">Items:</p>
                          <ul className="space-y-1">
                            {order.items.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mb-3">
                          <p className="text-xs text-gray-500">Delivery Address:</p>
                          <p className="text-sm text-gray-700">{order.address}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">৳{order.total.toFixed(2)}</p>
                            {order.paymentMethod && (
                              <p className="text-xs text-gray-500 mt-1">
                                Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'bKash'}
                              </p>
                            )}
                          </div>
                          {(order.status === 'processing' || order.status === 'confirmed') && (
                            <Button
                              onClick={() => handleOpenRefundDialog(order.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Request Refund
                            </Button>
                          )}
                          {order.status === 'shipped' && (
                            <Badge className="bg-indigo-100 text-indigo-700">
                              On the way
                            </Badge>
                          )}
                          {order.status === 'delivered' && (
                            <Badge className="bg-green-100 text-green-700">
                              ✓ Delivered
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Delivery Addresses</CardTitle>
                        <CardDescription>Manage your delivery addresses</CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          setEditingAddress(null);
                          setNewAddress({ type: 'Home', street: '', city: '', district: '', postalCode: '', phone: '' });
                          setShowAddressForm(!showAddressForm);
                        }}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                      </Button>
                    </div>
                  </CardHeader>
                  {showAddressForm && (
                    <CardContent className="border-t pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label>Address Type</Label>
                          <Input
                            value={newAddress.type}
                            onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Phone Number *</Label>
                          <Input
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Street Address *</Label>
                          <Input
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>City *</Label>
                          <Input
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>District *</Label>
                          <Input
                            value={newAddress.district}
                            onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Postal Code</Label>
                          <Input
                            value={newAddress.postalCode}
                            onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddAddress} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                          {editingAddress ? 'Update Address' : 'Save Address'}
                        </Button>
                        <Button onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                          setNewAddress({ type: 'Home', street: '', city: '', district: '', postalCode: '', phone: '' });
                        }} variant="outline">
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {addresses.map((address) => (
                  <Card key={address.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-100 p-3 rounded-lg">
                            <MapPin className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="text-gray-900 mb-1">{address.type}</h3>
                            {address.isDefault && (
                              <Badge className="bg-green-100 text-green-700">Default</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAddress(address)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteAddress(address.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{address.street}</p>
                        <p>{address.city}, {address.district} {address.postalCode}</p>
                        <p>{address.phone}</p>
                      </div>
                      {!address.isDefault && (
                        <Button
                          onClick={() => handleSetDefaultAddress(address.id)}
                          variant="outline"
                          size="sm"
                          className="mt-4"
                        >
                          Set as Default
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Prescriptions Tab */}
            {activeTab === 'prescriptions' && (
              <Card>
                <CardHeader>
                  <CardTitle>My Prescriptions</CardTitle>
                  <CardDescription>View all your uploaded prescriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  {user && prescriptions.filter(p => p.userId === user.id).length > 0 ? (
                    <div className="grid gap-4">
                      {prescriptions
                        .filter(p => p.userId === user.id)
                        .sort(sortByStatusAndDate)
                        .map((prescription) => (
                          <Card key={prescription.id} className={`border-2 ${prescription.status === 'pending' ? 'border-amber-300 bg-amber-50/30' :
                            prescription.status === 'approved' ? 'border-green-300 bg-green-50/30' :
                              'border-red-300 bg-red-50/30'
                            }`}>
                            <CardContent className="p-6">
                              <div className="grid md:grid-cols-2 gap-6">
                                {/* Prescription Image */}
                                <div>
                                  <img
                                    src={prescription.image}
                                    alt="Prescription"
                                    className="w-full h-64 object-contain rounded-xl border-2 border-amber-200 bg-gray-50"
                                  />
                                </div>

                                {/* Prescription Details */}
                                <div className="space-y-4">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-bold text-gray-900">Prescription #{prescription.id}</h3>
                                        <Badge className={
                                          prescription.status === 'pending' ? 'bg-amber-500' :
                                            prescription.status === 'approved' ? 'bg-green-500' :
                                              'bg-red-500'
                                        }>
                                          {prescription.status.toUpperCase()}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-1">
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        Uploaded: {prescription.uploadDate}
                                      </p>
                                      {prescription.notes && (
                                        <p className="text-sm text-gray-700 mt-2">{prescription.notes}</p>
                                      )}
                                    </div>
                                  </div>

                                  {prescription.status === 'pending' && (
                                    <div className="bg-amber-100 border border-amber-300 rounded-lg p-3">
                                      <p className="text-sm text-amber-700">
                                        Your prescription is under review. Our pharmacist will process it soon.
                                      </p>
                                    </div>
                                  )}

                                  {prescription.status === 'approved' && (
                                    <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                                      <p className="text-sm text-green-700 font-medium">
                                        ✓ Prescription approved! Medicines have been added to your cart. Check your cart to complete the order.
                                      </p>
                                    </div>
                                  )}

                                  {prescription.status === 'rejected' && (
                                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                                      <p className="text-sm text-red-700">
                                        Prescription was rejected. Please upload a clear prescription image or contact support.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-gray-900 mb-2">No prescriptions yet</h3>
                      <p className="text-gray-600 mb-4">Upload your prescription to get medicines delivered</p>
                      <Button
                        onClick={() => setShowPrescriptionUploadDialog(true)}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Prescription
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <Label>Current Password</Label>
                        <Input type="password" className="mt-1" />
                      </div>
                      <div>
                        <Label>New Password</Label>
                        <Input type="password" className="mt-1" />
                      </div>
                      <div>
                        <Label>Confirm New Password</Label>
                        <Input type="password" className="mt-1" />
                      </div>
                      <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                        Update Password
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-gray-900 mb-4">Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Email Notifications</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Order Updates</span>
                        <input type="checkbox" defaultChecked className="toggle" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Promotional Emails</span>
                        <input type="checkbox" className="toggle" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Profile Photo Dialog */}
      <Dialog open={showProfilePhotoDialog} onOpenChange={setShowProfilePhotoDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Manage Profile Photo</DialogTitle>
            <DialogDescription>
              Upload, update, or remove your profile photo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-32 w-32 ring-4 ring-amber-100">
                <AvatarImage src={profileImage} />
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-500 text-white text-4xl">
                  {user?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-4">
              <ImageUploadWithCrop
                currentImage={profileImage}
                onImageSelected={(imageData) => {
                  handleProfileImageUpload(imageData);
                  if (imageData) {
                    setShowProfilePhotoDialog(false);
                  }
                }}
                aspectRatio={1}
                label="Upload or Update Photo"
              />
              {profileImage && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 text-center">
                    Click the image preview to remove or upload a new photo
                  </p>
                  <Button
                    onClick={() => {
                      setProfileImage('');
                      if (user) {
                        localStorage.removeItem(`profileImage_${user.id}`);
                      }
                      toast.success('Profile photo removed');
                      setShowProfilePhotoDialog(false);
                    }}
                    variant="outline"
                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Photo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescription Upload Dialog */}
      <Dialog open={showPrescriptionUploadDialog} onOpenChange={setShowPrescriptionUploadDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-amber-600" />
              Upload Prescription
            </DialogTitle>
            <DialogDescription>
              Upload your prescription image. Our pharmacist will review and verify it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            <div>
              <Label>Upload Prescription Image</Label>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                Upload a clear image of your prescription. You can crop and adjust it before uploading.
              </p>
              <div className="w-full">
                <ImageUploadWithCrop
                  currentImage={prescriptionImage}
                  onImageSelected={(image) => setPrescriptionImage(image)}
                  aspectRatio={4 / 3}
                  label=""
                />
              </div>
            </div>
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex gap-2 justify-end pt-4 border-t mt-4 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowPrescriptionUploadDialog(false);
                setPrescriptionImage('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!prescriptionImage) {
                  toast.error('Please upload a prescription image first');
                  return;
                }
                if (!user) {
                  toast.error('Please login to upload prescription');
                  return;
                }

                addPrescription({
                  userId: user.id || 'user1',
                  userName: user.name,
                  userEmail: user.email,
                  image: prescriptionImage,
                  status: 'pending',
                  uploadDate: new Date().toLocaleString(),
                  notes: '',
                });

                setShowPrescriptionUploadDialog(false);
                setPrescriptionImage('');
                toast.success('Prescription uploaded successfully! Our pharmacist will review it soon.');
              }}
              disabled={!prescriptionImage}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Prescription
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
            <DialogDescription>
              Please provide your payment details for the refund.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Refund Method</Label>
              <div className="flex gap-4">
                {['bkash', 'nagad', 'rocket'].map((method) => (
                  <div
                    key={method}
                    onClick={() => setRefundMethod(method)}
                    className={`flex-1 p-3 rounded-lg border cursor-pointer text-center capitalize transition-all ${refundMethod === method
                      ? 'border-amber-500 bg-amber-50 text-amber-700 font-medium ring-1 ring-amber-500'
                      : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                      }`}
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={refundNumber}
                onChange={(e) => setRefundNumber(e.target.value)}
                placeholder="Enter your mobile number"
              />
            </div>
            <Button
              onClick={handleRequestRefund}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              Submit Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
