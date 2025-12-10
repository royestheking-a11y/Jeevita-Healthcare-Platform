import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Review } from '../contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ImageUploadWithCrop } from '../components/ImageUploadWithCrop';
import {
  Users, Calendar, Package, DollarSign, Stethoscope, MessageSquare,
  CheckCircle, XCircle, TrendingUp, Pill, ShoppingBag, Image as ImageIcon,
  Plus, Edit, Trash2, Send, LayoutDashboard, Menu, X as CloseIcon, Shield,
  Activity, FileText, Settings, ChevronRight,
  ArrowUpRight, Eye, RotateCcw, Clock, Building2, Heart, Star,
  PlayCircle, Upload, Youtube
} from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '../contexts/DataContext';
import { Separator } from '../components/ui/separator';
import { usersAPI, messagesAPI, refundsAPI, settingsAPI, cartsAPI, reviewsAPI } from '../utils/api';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';
import { ScrollArea } from '../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'; // Import Tabs
import { NotificationService } from '../utils/notifications';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';


interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

export function AdminPanel({ onNavigate }: AdminPanelProps) {
  const { user, logout } = useAuth();
  const {
    doctors,
    medicines,
    hospitals,
    appointments,
    prescriptions,
    payments,
    carouselSlides,
    userActivities,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    addHospital,
    updateHospital,
    deleteHospital,
    addCarouselSlide,
    updateCarouselSlide,
    deleteCarouselSlide,
    updateAppointment,
    deleteAppointment,
    updatePrescription,
    deletePrescription,
    updatePayment,
    deletePayment,
    deleteUserActivity,
  } = useData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [showHospitalForm, setShowHospitalForm] = useState(false);
  const [showCarouselForm, setShowCarouselForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [editingMedicine, setEditingMedicine] = useState<any>(null);
  const [editingHospital, setEditingHospital] = useState<any>(null);
  const [editingCarousel, setEditingCarousel] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedPrescriptionImage, setSelectedPrescriptionImage] = useState<string | null>(null);
  const [showUserCartDialog, setShowUserCartDialog] = useState(false);
  const [selectedUserForCart, setSelectedUserForCart] = useState<any>(null);
  const [userCartItems, setUserCartItems] = useState<any[]>([]);
  const [revenueFilter, setRevenueFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Form states
  const [doctorForm, setDoctorForm] = useState({
    name: '', specialty: '', experience: '', fee: '', rating: '', patients: '',
    availability: '', image: ''
  });

  const [medicineForm, setMedicineForm] = useState({
    name: '', company: '', type: '', price: '', stock: '', image: '', description: '',
    genericName: '', manufacturer: '', form: '', strength: ''
  });

  const [hospitalForm, setHospitalForm] = useState({
    name: '',
    address: '',
    specialty: '',
    image: '',
    phone: '',
    hours: '',
    description: '',
    departments: '',
    facilities: '',
    beds: '',
    staff: '',
    email: '',
    rating: '4.8'
  });



  const [carouselForm, setCarouselForm] = useState({
    title: '', subtitle: '', cta: '', image: '',
    buttonText: 'Get Started',
    buttonType: 'custom',
    buttonLink: '',
    videoType: 'none',
    videoUrl: '',
    videoFile: null as File | null
  });

  // Load messages from API
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [refundRequests, setRefundRequests] = useState<any[]>([]);

  const [deliveryChargeDhaka, setDeliveryChargeDhaka] = useState('70');
  const [deliveryChargeOutside, setDeliveryChargeOutside] = useState('120');
  const [socialLinks, setSocialLinks] = useState({ facebook: 'https://facebook.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' });

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [messagesData, usersData, refundsData, dhakaSetting, outsideSetting, socialLinksSetting, reviewsData] = await Promise.all([
          messagesAPI.getAll().catch(() => []),
          usersAPI.getAll().catch(() => []),
          refundsAPI.getAll().catch(() => []),
          settingsAPI.get('deliveryChargeDhaka').catch(() => ({ value: '70' })),
          settingsAPI.get('deliveryChargeOutside').catch(() => ({ value: '120' })),
          settingsAPI.get('socialMediaLinks').catch(() => ({ value: { facebook: 'https://facebook.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' } })),
          reviewsAPI.getAllAdmin().catch(() => [])
        ]);

        // Normalize IDs
        setLiveMessages(messagesData.map((m: any) => ({ ...m, id: m._id || m.id })));
        setPendingUsers(usersData.map((u: any) => ({ ...u, id: u._id || u.id, date: u.date || new Date(u.createdAt || Date.now()).toISOString().split('T')[0] })));
        setRefundRequests(refundsData.map((r: any) => ({ ...r, id: r._id || r.id })));
        setDeliveryChargeDhaka(dhakaSetting.value || '70');
        setDeliveryChargeOutside(outsideSetting.value || '120');
        setSocialLinks(socialLinksSetting.value || { facebook: 'https://facebook.com', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com' });
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    };
    loadData();
  }, []);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [messagesData, usersData, refundsData, reviewsData] = await Promise.all([
          messagesAPI.getAll().catch(() => []),
          usersAPI.getAll().catch(() => []),
          refundsAPI.getAll().catch(() => []),
          reviewsAPI.getAllAdmin().catch(() => [])
        ]);

        setLiveMessages(messagesData.map((m: any) => ({ ...m, id: m._id || m.id })));
        setPendingUsers(usersData.map((u: any) => ({ ...u, id: u._id || u.id, date: u.date || new Date(u.createdAt || Date.now()).toISOString().split('T')[0] })));
        setRefundRequests(refundsData.map((r: any) => ({ ...r, id: r._id || r.id })));
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error refreshing admin data:', error);
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate stats from DataContext
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const verifiedPayments = payments.filter(p => p.status === 'verified');
  const appointmentRevenue = verifiedPayments
    .filter(p => p.type === 'appointment')
    .reduce((sum, p) => sum + p.amount, 0);
  const medicineRevenue = verifiedPayments
    .filter(p => p.type === 'medicine')
    .reduce((sum, p) => sum + p.amount, 0);

  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
  const totalRefunds = refundRequests.length;
  const pendingRefunds = refundRequests.filter(r => r.status === 'pending').length;

  // Calculate stats - ensure it's reactive to payments changes
  const stats = useMemo(() => {
    // Count all medicine orders except rejected ones
    const totalMedicineOrders = payments.filter(p => p.type === 'medicine' && p.status !== 'rejected').length;
    return {
      totalUsers: pendingUsers.length,
      totalDoctors: doctors.length,
      totalAppointments: appointments.length,
      cancelledAppointments,
      totalMedicineOrders,
      totalMedicines: medicines.length,
      totalHospitals: hospitals.length,
      totalRefunds,
      pendingRefunds,
      appointmentRevenue,
      medicineRevenue,
      totalRevenue: appointmentRevenue + medicineRevenue,
    };
  }, [payments, doctors, appointments, cancelledAppointments, medicines, hospitals, totalRefunds, pendingRefunds, appointmentRevenue, medicineRevenue, pendingUsers]);

  // paymentActivities are now derived from payments
  const paymentActivities = payments.filter(p => p.status === 'verified' || p.status === 'rejected').map(p => ({
    id: p.id,
    user: p.user,
    type: p.type === 'appointment' ? 'Appointment' : 'Medicine Order',
    amount: p.amount,
    transactionId: p.transactionId,
    action: p.status === 'verified' ? 'Verified' : 'Rejected',
    timestamp: p.timestamp,
    date: p.date,
  }));

  const [replyText, setReplyText] = useState('');
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  // Handlers
  // Handlers
  const handleDeleteUser = async (id: string) => {
    try {
      const user = pendingUsers.find(u => u.id === id || u._id === id);
      const mongoId = user?._id || id;
      await usersAPI.delete(mongoId);
      setPendingUsers(prev => prev.filter(u => u.id !== id && u._id !== id));
      toast.success('User deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleVerifyPayment = (id: string) => {
    const payment = payments.find(p => p.id === id);
    // For medicine orders, set orderStatus to 'confirmed' when verifying payment
    if (payment && payment.type === 'medicine') {
      updatePayment(id, { status: 'verified', orderStatus: 'confirmed' });
      // Send notification to user
      NotificationService.notifyOrderConfirmed(payment.orderId || payment.id, payment.amount);
    } else if (payment && payment.type === 'appointment') {
      updatePayment(id, { status: 'verified' });
      // Find and notify about appointment confirmation
      const appointment = appointments.find(a =>
        a.patientEmail === payment.userEmail &&
        a.transactionId === payment.transactionId
      );
      if (appointment) {
        NotificationService.notifyAppointmentConfirmed(
          appointment.doctorName,
          appointment.date,
          appointment.time
        );
      }
    } else {
      updatePayment(id, { status: 'verified' });
    }
    toast.success('Payment verified successfully!');
  };

  const handleRejectPayment = (id: string) => {
    const payment = payments.find(p => p.id === id);
    // For medicine orders, set orderStatus to 'rejected' when rejecting payment
    if (payment && payment.type === 'medicine') {
      updatePayment(id, { status: 'rejected', orderStatus: 'rejected' });
    } else {
      updatePayment(id, { status: 'rejected' });
    }
    toast.error('Payment rejected');
  };

  const handleSendMessage = async (messageId: string) => {
    if (!replyText.trim()) return;

    try {
      const message = liveMessages.find(m => m.id === messageId || m._id === messageId);
      const mongoId = message?._id || messageId;
      await messagesAPI.addReply(mongoId, { admin: true, text: replyText, timestamp: new Date().toLocaleString() });
      await messagesAPI.update(mongoId, { status: 'read' });

      setLiveMessages(prev => prev.map(msg =>
        (msg.id === messageId || msg._id === messageId)
          ? {
            ...msg,
            status: 'read',
            replies: [...(msg.replies || []), { admin: true, text: replyText, timestamp: new Date().toLocaleString() }]
          }
          : msg
      ));
      setReplyText('');
      toast.success('Message sent!');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const message = liveMessages.find(m => m.id === messageId || m._id === messageId);
      const mongoId = message?._id || messageId;
      await messagesAPI.update(mongoId, { status: 'read' });
      setLiveMessages(prev => prev.map(msg =>
        (msg.id === messageId || msg._id === messageId) ? { ...msg, status: 'read' } : msg
      ));
    } catch (error) {
      toast.error('Failed to update message');
    }
  };

  const handleApproveRefund = async (id: string) => {
    try {
      const refund = refundRequests.find(r => r.id === id || r._id === id);
      const mongoId = refund?._id || id;
      await refundsAPI.update(mongoId, { status: 'approved' });
      setRefundRequests(prev => prev.map(req =>
        (req.id === id || req._id === id) ? { ...req, status: 'approved' } : req
      ));
      toast.success('Refund approved! Amount will be processed.');
    } catch (error) {
      toast.error('Failed to approve refund');
    }
  };

  const handleRejectRefund = async (id: string) => {
    try {
      const refund = refundRequests.find(r => r.id === id || r._id === id);
      const mongoId = refund?._id || id;
      await refundsAPI.update(mongoId, { status: 'rejected' });
      setRefundRequests(prev => prev.map(req =>
        (req.id === id || req._id === id) ? { ...req, status: 'rejected' } : req
      ));
      toast.error('Refund request rejected');
    } catch (error) {
      toast.error('Failed to reject refund');
    }
  };

  const handleDeleteRefund = async (id: string) => {
    try {
      const refund = refundRequests.find(r => r.id === id || r._id === id);
      const mongoId = refund?._id || id;
      await refundsAPI.delete(mongoId);
      setRefundRequests(prev => prev.filter(req => req.id !== id && req._id !== id));
      toast.success('Refund request deleted');
    } catch (error) {
      toast.error('Failed to delete refund');
    }
  };

  const handleConfirmAppointment = (id: string) => {
    const appointment = appointments.find(a => a.id === id);
    updateAppointment(id, { status: 'confirmed' });
    toast.success('Appointment confirmed!');
    // Send notification
    if (appointment) {
      NotificationService.notifyAppointmentConfirmed(
        appointment.doctorName,
        appointment.date,
        appointment.time
      );
    }
  };

  // Auto-confirm appointments when payment is verified
  useEffect(() => {
    const verifiedPayments = payments.filter(p => p.status === 'verified' && p.type === 'appointment');
    verifiedPayments.forEach(payment => {
      const appointment = appointments.find(a =>
        a.patientEmail === payment.userEmail &&
        a.transactionId === payment.transactionId &&
        a.status === 'pending'
      );
      if (appointment) {
        updateAppointment(appointment.id, { status: 'confirmed' });
      }
    });
  }, [payments, appointments, updateAppointment]);

  const handleCompleteAppointment = (id: string) => {
    updateAppointment(id, { status: 'completed' });
    toast.success('Appointment marked as completed!');
  };

  const handleCancelAppointment = (id: string) => {
    updateAppointment(id, { status: 'cancelled' });
    toast.error('Appointment cancelled');
  };

  const handleDeleteAppointment = (id: string) => {
    deleteAppointment(id);
    toast.success('Appointment deleted');
  };

  const handleApprovePrescription = (id: string) => {
    const prescription = prescriptions.find(p => p.id === id);
    updatePrescription(id, { status: 'approved' });
    toast.success('Prescription approved!');
    // Send notification
    if (prescription) {
      NotificationService.notifyPrescriptionReady(prescription.userName);
    }
  };

  const handleRejectPrescription = (id: string) => {
    updatePrescription(id, { status: 'rejected' });
    toast.error('Prescription rejected');
  };

  const handleDeletePrescription = (id: string) => {
    deletePrescription(id);
    toast.success('Prescription deleted');
  };

  const handleDeleteUserActivity = async (id: string) => {
    try {
      await deleteUserActivity(id);
      toast.success('Activity deleted');
    } catch (error) {
      toast.error('Failed to delete activity');
    }
  };

  const handleDeletePaymentActivity = (id: string) => {
    deletePayment(id);
    toast.success('Activity deleted');
  };

  const handleAddDoctor = async () => {
    if (!doctorForm.name || !doctorForm.specialty) {
      toast.error('Please fill in all required fields (Name, Specialty)');
      return;
    }
    try {
      let imageUrl = doctorForm.image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400';
      // Upload to Cloudinary if it's a base64 image
      if (doctorForm.image && doctorForm.image.startsWith('data:')) {
        toast.info('Uploading image...');
        imageUrl = await uploadToCloudinary(doctorForm.image, 'doctors');
      }
      addDoctor({
        name: doctorForm.name,
        specialty: doctorForm.specialty,
        degrees: '',
        experience: Number(doctorForm.experience) || 0,
        rating: Number(doctorForm.rating) || 4.5,
        image: imageUrl,
        location: '',
        fee: Number(doctorForm.fee) || 0,
        availability: doctorForm.availability ? doctorForm.availability.split(',').map(s => s.trim()) : [],
        timeSlots: ['10:00 AM', '2:00 PM', '4:00 PM'],
      });
      setDoctorForm({ name: '', specialty: '', experience: '', fee: '', rating: '', patients: '', availability: '', image: '' });
      setEditingDoctor(null);
      setShowDoctorForm(false);
      toast.success('Doctor added successfully!');
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleAddMedicine = async () => {
    if (!medicineForm.name || !medicineForm.company) {
      toast.error('Please fill in all required fields (Name, Company)');
      return;
    }
    try {
      let imageUrl = medicineForm.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400';
      // Upload to Cloudinary if it's a base64 image
      if (medicineForm.image && medicineForm.image.startsWith('data:')) {
        toast.info('Uploading image...');
        imageUrl = await uploadToCloudinary(medicineForm.image, 'medicines');
      }
      addMedicine({
        name: medicineForm.name,
        brand: medicineForm.company,
        price: Number(medicineForm.price) || 0,
        image: imageUrl,
        category: medicineForm.type || 'Tablet',
        inStock: Number(medicineForm.stock) > 0,
        description: medicineForm.description,
        genericName: medicineForm.genericName,
        manufacturer: medicineForm.manufacturer,
        form: medicineForm.type || 'Tablet', // Use type as form for now
        strength: medicineForm.strength,
      });
      setMedicineForm({
        name: '', company: '', type: '', price: '', stock: '', image: '', description: '',
        genericName: '', manufacturer: '', form: '', strength: ''
      });
      setEditingMedicine(null);
      setShowMedicineForm(false);
      toast.success('Medicine added successfully!');
    } catch (error) {
      console.error('Error adding medicine:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleAddCarousel = async () => {
    // Check if at least title is present. 
    // Image is optional if video is present (we auto-generate thumbnail), but at least one media is needed.
    if (!carouselForm.title) {
      toast.error('Please fill in the title');
      return;
    }
    // If no video, then image is required
    if (carouselForm.videoType === 'none' && !carouselForm.image) {
      toast.error('Please upload an image');
      return;
    }
    try {
      let imageUrl = carouselForm.image;
      // Upload to Cloudinary if it's a base64 image
      if (carouselForm.image.startsWith('data:')) {
        toast.info('Uploading image...');
        imageUrl = await uploadToCloudinary(carouselForm.image, 'carousel');
      }

      let videoUrl = carouselForm.videoUrl;
      if (carouselForm.videoType === 'upload' && carouselForm.videoFile) {
        toast.info('Uploading video...');
        videoUrl = await uploadToCloudinary(carouselForm.videoFile, 'carousel', 'video');
      }

      let finalImageUrl = imageUrl;

      // If no image provided but we have a video URL (uploaded or youtube)
      if (!finalImageUrl && videoUrl) {
        if (carouselForm.videoType === 'upload' && videoUrl.includes('cloudinary.com')) {
          // Generate JPG thumbnail from Cloudinary Video URL
          // Change file extension to .jpg (Cloudinary auto-generates thumbnails)
          const parts = videoUrl.split('.');
          parts.pop();
          finalImageUrl = parts.join('.') + '.jpg';
        } else if (carouselForm.videoType === 'youtube') {
          // Attempt to get YouTube thumbnail
          try {
            let videoId = '';
            if (videoUrl.includes('v=')) videoId = videoUrl.split('v=')[1].split('&')[0];
            else if (videoUrl.includes('youtu.be/')) videoId = videoUrl.split('youtu.be/')[1].split('?')[0];

            if (videoId) finalImageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          } catch (e) {
            console.log('Could not extract YouTube thumbnail');
          }
        }
      }

      await addCarouselSlide({
        image: finalImageUrl || '', // Allow empty if no image and no video thumbnail could be generated
        title: carouselForm.title,
        subtitle: carouselForm.subtitle,
        cta: carouselForm.buttonText,
        buttonText: carouselForm.buttonText,
        buttonType: carouselForm.buttonType as 'order' | 'appointment' | 'hospital' | 'custom',
        buttonLink: carouselForm.buttonLink,
        videoType: carouselForm.videoType as 'none' | 'youtube' | 'upload',
        videoUrl: videoUrl
      });
      setCarouselForm({ title: '', subtitle: '', cta: '', image: '', buttonText: '', buttonType: '', buttonLink: '', videoType: 'none', videoUrl: '', videoFile: null });
      setEditingCarousel(null);
      setShowCarouselForm(false);
      toast.success('Carousel slide added successfully!');
    } catch (error) {
      console.error('Error adding carousel:', error);
      toast.error('Failed to upload media. Please try again.');
    }
  };

  const handleEditCarousel = (slide: any) => {
    setEditingCarousel(slide);
    setCarouselForm({
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      cta: slide.cta || '',
      image: slide.image || '',
      buttonText: slide.buttonText || 'Get Started',
      buttonType: slide.buttonType || 'custom',
      buttonLink: slide.buttonLink || '',
      videoType: slide.videoType || 'none',
      videoUrl: slide.videoUrl || '',
      videoFile: null
    });
    setShowCarouselForm(true);
  };

  const handleUpdateCarousel = async () => {
    if (!editingCarousel) return;

    if (!carouselForm.title) {
      toast.error('Please fill in the title');
      return;
    }
    // If no video (and not editing an existing video carousel), then image is required
    // Complex check: if creating new video or keeping existing video, image is optional. 
    // If resetting to no video, image is required.
    if (carouselForm.videoType === 'none' && !carouselForm.image) {
      toast.error('Please upload an image');
      return;
    }

    try {
      let imageUrl = carouselForm.image;
      // Upload to Cloudinary if it's a new base64 image
      if (carouselForm.image.startsWith('data:')) {
        toast.info('Uploading image...');
        imageUrl = await uploadToCloudinary(carouselForm.image, 'carousel');
      }

      let videoUrl = carouselForm.videoUrl;
      if (carouselForm.videoType === 'upload' && carouselForm.videoFile) {
        toast.info('Uploading video...');
        videoUrl = await uploadToCloudinary(carouselForm.videoFile, 'carousel', 'video');
      }

      let finalImageUrl = imageUrl;
      // If no image provided but we have a video URL (uploaded or youtube)
      if (!finalImageUrl && videoUrl) {
        if (carouselForm.videoType === 'upload' && videoUrl.includes('cloudinary.com')) {
          const parts = videoUrl.split('.');
          parts.pop();
          finalImageUrl = parts.join('.') + '.jpg';
        } else if (carouselForm.videoType === 'youtube') {
          try {
            let videoId = '';
            if (videoUrl.includes('v=')) videoId = videoUrl.split('v=')[1].split('&')[0];
            else if (videoUrl.includes('youtu.be/')) videoId = videoUrl.split('youtu.be/')[1].split('?')[0];

            if (videoId) finalImageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          } catch (e) { console.log('Could not extract YouTube thumbnail'); }
        }
      }

      await updateCarouselSlide(editingCarousel.id, {
        image: finalImageUrl || '',
        title: carouselForm.title,
        subtitle: carouselForm.subtitle,
        cta: carouselForm.buttonText, // Use buttonText as CTA to satisfy backend requirement
        buttonText: carouselForm.buttonText,
        buttonType: carouselForm.buttonType as 'order' | 'appointment' | 'hospital' | 'custom',
        buttonLink: carouselForm.buttonLink,
        videoType: carouselForm.videoType as 'none' | 'youtube' | 'upload',
        videoUrl: videoUrl
      });
      setCarouselForm({ title: '', subtitle: '', cta: '', image: '', buttonText: 'Get Started', buttonType: 'custom', buttonLink: '', videoType: 'none', videoUrl: '', videoFile: null });
      setEditingCarousel(null);
      setShowCarouselForm(false);
      toast.success('Carousel slide updated successfully!');
    } catch (error) {
      console.error('Error updating carousel:', error);
      toast.error('Failed to upload media. Please try again.');
    }
  };

  const handleDeleteCarousel = (id: string) => {
    deleteCarouselSlide(id);
    toast.success('Carousel slide deleted');
  };

  const handleEditDoctor = (doctor: any) => {
    setEditingDoctor(doctor);
    setDoctorForm({
      name: doctor.name || '',
      specialty: doctor.specialty || '',
      experience: doctor.experience?.toString() || '',
      fee: doctor.fee?.toString() || '',
      rating: doctor.rating?.toString() || '',
      patients: '',
      availability: doctor.availability?.join(', ') || '',
      image: doctor.image || '',
    });
    setShowDoctorForm(true);
  };

  const handleUpdateDoctor = async () => {
    if (!editingDoctor || !doctorForm.name || !doctorForm.specialty) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      let imageUrl = doctorForm.image;
      // Upload to Cloudinary if it's a new base64 image
      if (doctorForm.image && doctorForm.image.startsWith('data:')) {
        toast.info('Uploading image...');
        imageUrl = await uploadToCloudinary(doctorForm.image, 'doctors');
      }
      updateDoctor(editingDoctor.id, {
        name: doctorForm.name,
        specialty: doctorForm.specialty,
        experience: Number(doctorForm.experience),
        rating: Number(doctorForm.rating),
        image: imageUrl,
        fee: Number(doctorForm.fee),
        availability: doctorForm.availability ? doctorForm.availability.split(',').map(s => s.trim()) : [],
      });
      setDoctorForm({ name: '', specialty: '', experience: '', fee: '', rating: '', patients: '', availability: '', image: '' });
      setEditingDoctor(null);
      setShowDoctorForm(false);
      toast.success('Doctor updated successfully!');
    } catch (error) {
      console.error('Error updating doctor:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleDeleteDoctor = (id: string) => {
    deleteDoctor(id);
    toast.success('Doctor removed');
  };

  const handleEditMedicine = (medicine: any) => {
    setEditingMedicine(medicine);
    setMedicineForm({
      name: medicine.name || '',
      company: medicine.brand || '',
      type: medicine.category || '',
      price: medicine.price?.toString() || '',
      stock: '',
      image: medicine.image || '',
      description: medicine.description || '',
      genericName: medicine.genericName || '',
      manufacturer: medicine.manufacturer || '',
      form: medicine.form || '',
      strength: medicine.strength || '',
    });
    setShowMedicineForm(true);
  };

  const handleUpdateMedicine = async () => {
    if (!editingMedicine || !medicineForm.name || !medicineForm.company) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      let imageUrl = medicineForm.image;
      // Upload to Cloudinary if it's a new base64 image
      if (medicineForm.image && medicineForm.image.startsWith('data:')) {
        toast.info('Uploading image...');
        imageUrl = await uploadToCloudinary(medicineForm.image, 'medicines');
      }
      updateMedicine(editingMedicine.id, {
        name: medicineForm.name,
        brand: medicineForm.company,
        price: Number(medicineForm.price),
        image: imageUrl,
        category: medicineForm.type,
        inStock: Number(medicineForm.stock) > 0,
        description: medicineForm.description,
        genericName: medicineForm.genericName,
        manufacturer: medicineForm.manufacturer,
        form: medicineForm.type, // Sync type and form for now
        strength: medicineForm.strength,
      });
      setMedicineForm({
        name: '', company: '', type: '', price: '', stock: '', image: '', description: '',
        genericName: '', manufacturer: '', form: '', strength: ''
      });
      setEditingMedicine(null);
      setShowMedicineForm(false);
      toast.success('Medicine updated successfully!');
    } catch (error) {
      console.error('Error updating medicine:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleDeleteMedicine = (id: string) => {
    deleteMedicine(id);
    toast.success('Medicine removed');
  };

  const handleAddHospital = async () => {
    if (!hospitalForm.name || !hospitalForm.address || !hospitalForm.specialty) {
      toast.error('Please fill in all required fields (Name, Address, Specialty)');
      return;
    }
    try {
      let imageUrl = hospitalForm.image || 'https://images.unsplash.com/photo-1719934398679-d764c1410770?w=600';
      // Upload to Cloudinary if it's a base64 image
      if (hospitalForm.image && hospitalForm.image.startsWith('data:')) {
        toast.info('Uploading image...');
        imageUrl = await uploadToCloudinary(hospitalForm.image, 'hospitals');
      }
      addHospital({
        name: hospitalForm.name,
        address: hospitalForm.address,
        specialty: hospitalForm.specialty,
        image: imageUrl,
        phone: hospitalForm.phone || '+880 1700-000000',
        hours: hospitalForm.hours || '24/7 Available',
        description: hospitalForm.description || '',
        departments: hospitalForm.departments ? hospitalForm.departments.split(',').map(d => d.trim()).filter(d => d) : [],
        facilities: hospitalForm.facilities ? hospitalForm.facilities.split(',').map(f => f.trim()).filter(f => f) : [],
        beds: hospitalForm.beds || '200+ Beds',
        staff: hospitalForm.staff || '200+ Medical Staff',
        email: hospitalForm.email || `info@${hospitalForm.name.toLowerCase().replace(/\s+/g, '')}.com`,
        rating: parseFloat(hospitalForm.rating) || 4.8,
      });
      setHospitalForm({
        name: '',
        address: '',
        specialty: '',
        image: '',
        phone: '',
        hours: '',
        description: '',
        departments: '',
        facilities: '',
        beds: '',
        staff: '',
        email: '',
        rating: '4.8'
      });
      setEditingHospital(null);
      setShowHospitalForm(false);
      toast.success('Hospital added successfully!');
    } catch (error) {
      console.error('Error adding hospital:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleEditHospital = (hospital: any) => {
    setEditingHospital(hospital);
    setHospitalForm({
      name: hospital.name || '',
      address: hospital.address || '',
      specialty: hospital.specialty || '',
      image: hospital.image || '',
      phone: hospital.phone || '',
      hours: hospital.hours || '',
      description: hospital.description || '',
      departments: hospital.departments ? hospital.departments.join(', ') : '',
      facilities: hospital.facilities ? hospital.facilities.join(', ') : '',
      beds: hospital.beds || '',
      staff: hospital.staff || '',
      email: hospital.email || '',
      rating: hospital.rating?.toString() || '4.8',
    });
    setShowHospitalForm(true);
  };

  const handleUpdateHospital = async () => {
    if (!editingHospital || !hospitalForm.name || !hospitalForm.address || !hospitalForm.specialty) {
      toast.error('Please fill in all required fields (Name, Address, Specialty)');
      return;
    }
    try {
      let imageUrl = hospitalForm.image;
      // Upload to Cloudinary if it's a new base64 image
      if (hospitalForm.image && hospitalForm.image.startsWith('data:')) {
        toast.info('Uploading image...');
        imageUrl = await uploadToCloudinary(hospitalForm.image, 'hospitals');
      }
      updateHospital(editingHospital.id, {
        name: hospitalForm.name,
        address: hospitalForm.address,
        specialty: hospitalForm.specialty,
        image: imageUrl,
        phone: hospitalForm.phone || '+880 1700-000000',
        hours: hospitalForm.hours || '24/7 Available',
        description: hospitalForm.description || '',
        departments: hospitalForm.departments ? hospitalForm.departments.split(',').map(d => d.trim()).filter(d => d) : [],
        facilities: hospitalForm.facilities ? hospitalForm.facilities.split(',').map(f => f.trim()).filter(f => f) : [],
        beds: hospitalForm.beds || '200+ Beds',
        staff: hospitalForm.staff || '200+ Medical Staff',
        email: hospitalForm.email || `info@${hospitalForm.name.toLowerCase().replace(/\s+/g, '')}.com`,
        rating: parseFloat(hospitalForm.rating) || 4.8,
      });
      setHospitalForm({
        name: '',
        address: '',
        specialty: '',
        image: '',
        phone: '',
        hours: '',
        description: '',
        departments: '',
        facilities: '',
        beds: '',
        staff: '',
        email: '',
        rating: '4.8'
      });
      setEditingHospital(null);
      setShowHospitalForm(false);
      toast.success('Hospital updated successfully!');
    } catch (error) {
      console.error('Error updating hospital:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleDeleteHospital = (id: string) => {
    deleteHospital(id);
    toast.success('Hospital removed');
  };

  const handleUpdateReviewStatus = async (id: string, status: string) => {
    try {
      await reviewsAPI.updateStatus(id, status);
      setReviews(prev => prev.map(r => r._id === id || r.id === id ? { ...r, status: status as any } : r));
      toast.success(`Review ${status} `);
    } catch (error) {
      toast.error('Failed to update review status');
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await reviewsAPI.delete(id);
      setReviews(prev => prev.filter(r => r._id !== id && r.id !== id));
      toast.success('Review deleted');
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  // Admin access is controlled by AdminLoginPage, so no need to check here
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'orders', label: 'Orders Management', icon: ShoppingBag },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'payments', label: 'Payment Verification', icon: DollarSign },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'messages', label: 'Live Messages', icon: MessageSquare },
    { id: 'refunds', label: 'Refund Requests', icon: RotateCcw },
    { id: 'reviews', label: 'Review Management', icon: Star },
    { id: 'doctors', label: 'Manage Doctors', icon: Stethoscope },
    { id: 'medicines', label: 'Manage Medicines', icon: Pill },
    { id: 'hospitals', label: 'Manage Hospitals', icon: Building2 },
    { id: 'carousel', label: 'Carousel Manager', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-100/20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                {sidebarOpen ? <CloseIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 rounded-xl shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-gray-600">Manage Jeevita Platform</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  // Open the website in a new tab without logging out

                  const baseUrl = window.location.origin;
                  // Open in new tab - this keeps the admin panel open
                  window.open(baseUrl, '_blank', 'noopener,noreferrer');
                }}
                variant="outline"
                className="border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Visit Site
              </Button>
              <Button
                onClick={() => {
                  logout();
                  onNavigate('home');
                  toast.success('Logged out successfully');
                }}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-[73px] z-30 h-[calc(100vh-73px)] w-72 bg-gradient-to-b from-white via-amber-50/30 to-orange-50/20 backdrop-blur-xl border-r border-amber-200 transition-transform duration-300 shadow-2xl shadow-amber-500/10 flex flex-col overflow-hidden`}>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const unreadCount = item.id === 'messages' ? liveMessages.filter(m => m.status === 'unread').length :
                      item.id === 'refunds' ? refundRequests.filter(r => r.status === 'pending').length :
                        item.id === 'prescriptions' ? prescriptions.filter(p => p.status === 'pending').length : 0;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-200 group ${activeTab === item.id
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/40 scale-[1.02]'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100 hover:text-amber-800 hover:shadow-md'
                          } `}
                      >
                        <div className={`p-1.5 rounded-lg ${activeTab === item.id ? 'bg-white/20' : 'bg-amber-100 group-hover:bg-amber-200'} `}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                        {unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 min-w-[20px] justify-center">
                            {unreadCount}
                          </Badge>
                        )}
                        {activeTab === item.id && <ChevronRight className="h-4 w-4 animate-pulse" />}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </ScrollArea>
          </div>

          {/* Powered by Jeevita - Always visible at bottom of sidebar */}
          <div className="p-2.5 border-t border-amber-200/50 bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-amber-100/10 flex-shrink-0">
            <div className="text-center">
              <p className="text-xs font-semibold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent leading-tight">
                Powered by Jeevita
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">
                © 2025 All rights reserved
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
                <p className="text-gray-600">Welcome back, {user?.name}!</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Existing 4 cards */}
                <Card onClick={() => setActiveTab('users')} className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-amber-700 mb-1 font-medium">Total Users</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">{stats.totalUsers}</p>
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
                          <ArrowUpRight className="h-2.5 w-2.5 text-green-600" />
                          <span className="text-xs font-bold text-green-700">+12%</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl shadow-lg shadow-amber-500/30 flex-shrink-0">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card onClick={() => setActiveTab('doctors')} className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-orange-700 mb-1 font-medium">Total Doctors</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">{stats.totalDoctors}</p>
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
                          <TrendingUp className="h-2.5 w-2.5 text-green-600" />
                          <span className="text-xs font-bold text-green-700">+5 new</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-xl shadow-lg shadow-orange-500/30 flex-shrink-0">
                        <Stethoscope className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card onClick={() => setActiveTab('appointments')} className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-amber-700 mb-1 font-medium">Appointments</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">{stats.totalAppointments}</p>
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
                          <Activity className="h-2.5 w-2.5 text-green-600" />
                          <span className="text-xs font-bold text-green-700">+18%</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl shadow-lg shadow-amber-500/30 flex-shrink-0">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card onClick={() => setActiveTab('payments')} className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-orange-700 mb-1 font-medium">Total Revenue</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">৳{(stats.totalRevenue / 1000).toFixed(0)}K</p>
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
                          <ArrowUpRight className="h-2.5 w-2.5 text-green-600" />
                          <span className="text-xs font-bold text-green-700">+22%</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-xl shadow-lg shadow-orange-500/30 flex-shrink-0">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* New Cards */}
                <Card onClick={() => setActiveTab('medicines')} className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-amber-700 mb-1 font-medium">Total Medicines</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">{stats.totalMedicines}</p>
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
                          <TrendingUp className="h-2.5 w-2.5 text-green-600" />
                          <span className="text-xs font-bold text-green-700">Active</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl shadow-lg shadow-amber-500/30 flex-shrink-0">
                        <Pill className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card onClick={() => setActiveTab('hospitals')} className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-orange-700 mb-1 font-medium">Total Hospitals</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">{stats.totalHospitals}</p>
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
                          <Building2 className="h-2.5 w-2.5 text-green-600" />
                          <span className="text-xs font-bold text-green-700">Partners</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-xl shadow-lg shadow-orange-500/30 flex-shrink-0">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card onClick={() => setActiveTab('orders')} className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-amber-700 mb-1 font-medium">Total Orders</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                          {stats.totalMedicineOrders}
                        </p>
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-full">
                          <Package className="h-2.5 w-2.5 text-orange-600" />
                          <span className="text-xs font-bold text-orange-700">Medicine Orders</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl shadow-lg shadow-amber-500/30 flex-shrink-0">
                        <ShoppingBag className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card onClick={() => setActiveTab('refunds')} className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-amber-700 mb-1 font-medium">Refund Requests</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">{stats.totalRefunds}</p>
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-full">
                          <RotateCcw className="h-2.5 w-2.5 text-orange-600" />
                          <span className="text-xs font-bold text-orange-700">{stats.pendingRefunds} Pending</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl shadow-lg shadow-amber-500/30 flex-shrink-0">
                        <RotateCcw className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-amber-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-amber-600" />
                      Recent Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {pendingUsers.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No users yet</p>
                    ) : (
                      <div className="space-y-3">
                        {pendingUsers.slice(0, 3).map(user => (
                          <div key={user.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-amber-200 rounded-xl hover:shadow-md transition-all">
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <Badge className={`mt - 1 ${user.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                                } `}>
                                {user.status === 'approved' ? 'Active' : 'Disabled'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-2 border-amber-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-amber-600" />
                      Pending Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {pendingPayments.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No pending payments</p>
                    ) : (
                      <div className="space-y-3">
                        {pendingPayments.slice(0, 3).map(payment => (
                          <div key={payment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-amber-200 rounded-xl hover:shadow-md transition-all">
                            <div>
                              <p className="font-medium text-gray-900">{payment.user}</p>
                              <p className="text-sm text-gray-600">৳{payment.amount} - {payment.transactionId}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleVerifyPayment(payment.id)} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleRejectPayment(payment.id)} className="border-red-300 text-red-600 hover:bg-red-50">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">User Management</h2>
                  <p className="text-gray-600">View, disable, or delete users</p>
                </div>
              </div>

              {/* All Users List */}
              <Card className="border-2 border-amber-200">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-amber-600" />
                    All Users
                  </CardTitle>
                  <CardDescription>Manage all registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border-2 border-amber-200 rounded-xl hover:border-amber-400 hover:shadow-md transition-all bg-gradient-to-r from-amber-50/30 to-orange-50/30">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={
                              user.status === 'approved' ? 'bg-green-500' :
                                'bg-red-500'
                            }>
                              {user.status === 'approved' ? 'Active' : 'Disabled'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingUser(user);
                              setShowUserForm(true);
                            }}
                            className="border-amber-300 text-amber-600 hover:bg-amber-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              // Toggle user status (disable/enable)
                              const newStatus = user.status === 'approved' ? 'rejected' : 'approved';
                              // Optimistic update
                              setPendingUsers(pendingUsers.map(u =>
                                u.id === user.id ? { ...u, status: newStatus } : u
                              ));

                              // API update
                              try {
                                const mongoId = user._id || user.id;
                                await usersAPI.update(mongoId, { status: newStatus });
                                toast.success(newStatus === 'approved' ? 'User enabled' : 'User disabled');
                              } catch (error) {
                                // Revert on error
                                setPendingUsers(pendingUsers);
                                toast.error('Failed to update user status');
                              }
                            }}
                            className={user.status === 'approved' ? 'border-amber-300 text-amber-600 hover:bg-amber-50' : 'border-green-300 text-green-600 hover:bg-green-50'}
                          >
                            {user.status === 'approved' ? (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Disable
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Enable
                              </>
                            )}
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 border-red-200" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingUsers.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 text-amber-300 mx-auto mb-2" />
                        <p>No users found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-200">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-amber-600" />
                    User Activities
                  </CardTitle>
                  <CardDescription>Recent user actions and activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 border border-amber-200 rounded-xl hover:border-amber-300 hover:shadow-sm transition-all">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p - 2 rounded - lg ${activity.type === 'appointment' ? 'bg-blue-100' :
                            activity.type === 'order' ? 'bg-green-100' :
                              'bg-red-100'
                            } `}>
                            {activity.type === 'appointment' && <Calendar className="h-4 w-4 text-blue-600" />}
                            {activity.type === 'order' && <Pill className="h-4 w-4 text-green-600" />}
                            {activity.type === 'cancellation' && <XCircle className="h-4 w-4 text-red-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.userName}</p>
                            <p className="text-sm text-gray-600">{activity.email}</p>
                            <p className="text-sm text-gray-700 mt-1">{activity.action}</p>
                            <p className="text-xs text-amber-600 mt-1">{activity.timestamp}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteUserActivity(activity.id)} className="text-red-500 hover:bg-red-50 border-red-200">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {userActivities.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-12 w-12 text-amber-300 mx-auto mb-2" />
                        <p>No recent activities</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* View User Dialog */}
              <Dialog open={showUserForm && !!editingUser} onOpenChange={(open: boolean) => {
                if (!open) {
                  setShowUserForm(false);
                  setEditingUser(null);
                }
              }}>
                <DialogContent className="max-w-2xl bg-white">
                  <DialogHeader>
                    <DialogTitle>User Details</DialogTitle>
                    <DialogDescription>
                      View user information
                    </DialogDescription>
                  </DialogHeader>
                  {editingUser && (
                    <div className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={editingUser.name}
                          disabled
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={editingUser.email}
                          disabled
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Input
                          value={editingUser.status === 'approved' ? 'Active' : 'Disabled'}
                          disabled
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => {
                          setShowUserForm(false);
                          setEditingUser(null);
                        }}>
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Orders Management</h2>
                  <p className="text-gray-600">Manage all medicine orders</p>
                </div>
              </div>

              <div className="grid gap-4">
                {payments
                  .filter(p => p.type === 'medicine')
                  .map((order) => {
                    // Use orderStatus if available, otherwise derive from status
                    const orderStatus = order.orderStatus ||
                      (order.status === 'pending' ? 'pending' :
                        order.status === 'verified' ? 'confirmed' :
                          order.status === 'rejected' ? 'rejected' : 'confirmed');
                    return (
                      <Card key={order.id} className={`border-2 ${orderStatus === 'confirmed' ? 'border-blue-300 bg-blue-50/30' :
                        orderStatus === 'shipped' ? 'border-indigo-300 bg-indigo-50/30' :
                          orderStatus === 'delivered' ? 'border-green-300 bg-green-50/30' :
                            orderStatus === 'pending' ? 'border-amber-300 bg-amber-50/30' :
                              'border-red-300 bg-red-50/30'
                        } hover:shadow-xl transition-all`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className={`p - 3 rounded - full ${orderStatus === 'confirmed' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' :
                                orderStatus === 'shipped' ? 'bg-gradient-to-br from-indigo-500 to-purple-500' :
                                  orderStatus === 'delivered' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                                    orderStatus === 'pending' ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                                      'bg-gradient-to-br from-red-500 to-rose-500'
                                } `}>
                                <Package className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-gray-900">Order #{order.orderId || order.id}</h3>
                                  <Badge className={
                                    orderStatus === 'confirmed' ? 'bg-blue-500' :
                                      orderStatus === 'shipped' ? 'bg-indigo-500' :
                                        orderStatus === 'delivered' ? 'bg-green-500' :
                                          orderStatus === 'pending' ? 'bg-amber-500' :
                                            'bg-red-500'
                                  }>
                                    {orderStatus.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{order.user}</p>
                                <p className="text-xs text-gray-500">{order.userEmail}</p>
                                <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                                  <div className="flex items-center gap-1 text-gray-700">
                                    <Calendar className="h-3 w-3 text-amber-600" />
                                    <span>{order.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-700">
                                    <DollarSign className="h-3 w-3 text-amber-600" />
                                    <span>৳{order.amount.toFixed(2)}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-700">
                                    <Clock className="h-3 w-3 text-amber-600" />
                                    <span>{order.timestamp}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-gray-700 font-mono text-xs">
                                    <span className="text-gray-500">TxID:</span>
                                    <span className="text-amber-600">{order.transactionId}</span>
                                  </div>
                                </div>
                                {order.paymentMethod && (
                                  <div className="mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'bKash'}
                                    </Badge>
                                  </div>
                                )}
                                {order.address && (
                                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Delivery Address:</p>
                                    <p className="text-sm text-gray-700">
                                      {typeof order.address === 'string'
                                        ? order.address
                                        : `${order.address.street}, ${order.address.city}, ${order.address.district || ''} `}
                                    </p>
                                  </div>
                                )}
                                {order.items && order.items.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-xs text-gray-500 mb-2">Order Items ({order.items.length}):</p>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                      {order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-sm bg-white p-2 rounded border border-amber-100">
                                          <span className="text-gray-700">{item.name} x{item.quantity}</span>
                                          <span className="text-gray-900 font-semibold">৳{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>
                                    {order.deliveryFee && (
                                      <div className="mt-2 flex justify-between text-sm pt-2 border-t border-amber-200">
                                        <span className="text-gray-600">Delivery Fee:</span>
                                        <span className="text-gray-900 font-semibold">৳{order.deliveryFee.toFixed(2)}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons based on order status */}
                          {orderStatus === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  updatePayment(order.id, { orderStatus: 'rejected' as const, status: 'rejected' });
                                  toast.success('Order rejected');
                                }}
                                variant="outline"
                                className="flex-1 text-red-600 hover:bg-red-50 border-red-300"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Order
                              </Button>
                              <Button
                                onClick={() => {
                                  updatePayment(order.id, { orderStatus: 'confirmed' as const, status: 'verified' });
                                  toast.success('Order confirmed');
                                  // Send notification
                                  NotificationService.notifyOrderConfirmed(order.orderId || order.id, order.amount);
                                }}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm Order
                              </Button>
                            </div>
                          )}

                          {orderStatus === 'confirmed' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  updatePayment(order.id, { orderStatus: 'shipped' as const });
                                  toast.success('Order marked as shipped');
                                  // Send notification
                                  NotificationService.notifyOrderShipped(order.orderId || order.id);
                                }}
                                variant="outline"
                                className="flex-1 text-indigo-600 hover:bg-indigo-50 border-indigo-300"
                              >
                                <Package className="h-4 w-4 mr-2" />
                                Mark as Shipped
                              </Button>
                              <Button
                                onClick={() => {
                                  updatePayment(order.id, { orderStatus: 'delivered' as const });
                                  toast.success('Order marked as delivered');
                                  // Send notification
                                  NotificationService.notifyOrderDelivered(order.orderId || order.id);
                                }}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Delivered
                              </Button>
                            </div>
                          )}

                          {orderStatus === 'shipped' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  updatePayment(order.id, { orderStatus: 'delivered' as const });
                                  toast.success('Order marked as delivered');
                                  // Send notification
                                  NotificationService.notifyOrderDelivered(order.orderId || order.id);
                                }}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Delivered
                              </Button>
                            </div>
                          )}

                          {(orderStatus === 'delivered' || orderStatus === 'rejected') && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this order?')) {
                                    deletePayment(order.id);
                                    toast.success('Order deleted');
                                  }
                                }}
                                variant="outline"
                                className="flex-1 text-red-500 hover:bg-red-50 border-red-200"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Order
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                {payments.filter(p => p.type === 'medicine').length === 0 && (
                  <Card className="border-2 border-dashed border-amber-200">
                    <CardContent className="p-12 text-center">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600">Medicine orders will appear here</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointments Management</h2>
                  <p className="text-gray-600">Manage all doctor appointments</p>
                </div>
              </div>

              <div className="grid gap-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className={`border-2 ${appointment.status === 'pending' ? 'border-amber-300 bg-amber-50/30' :
                    appointment.status === 'confirmed' ? 'border-blue-300 bg-blue-50/30' :
                      appointment.status === 'completed' ? 'border-green-300 bg-green-50/30' :
                        'border-red-300 bg-red-50/30'
                    } hover:shadow-xl transition-all`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p - 3 rounded - full ${appointment.status === 'pending' ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                            appointment.status === 'confirmed' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' :
                              appointment.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                                'bg-gradient-to-br from-red-500 to-rose-500'
                            } `}>
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900">{appointment.patientName}</h3>
                              <Badge className={
                                appointment.status === 'pending' ? 'bg-amber-500' :
                                  appointment.status === 'confirmed' ? 'bg-blue-500' :
                                    appointment.status === 'completed' ? 'bg-green-500' :
                                      'bg-red-500'
                              }>
                                {appointment.status.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              With {appointment.doctorName} • {appointment.specialty}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-1 text-gray-700">
                                <Calendar className="h-3 w-3 text-amber-600" />
                                <span>{appointment.date}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-700">
                                <Clock className="h-3 w-3 text-amber-600" />
                                <span>{appointment.time}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-700">
                                <DollarSign className="h-3 w-3 text-amber-600" />
                                <span>৳{appointment.amount}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-700 font-mono text-xs">
                                <span className="text-gray-500">TxID:</span>
                                <span className="text-amber-600">{appointment.transactionId}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {appointment.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button onClick={() => handleCancelAppointment(appointment.id)} variant="outline" className="flex-1 text-red-600 hover:bg-red-50 border-red-200">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button onClick={() => handleConfirmAppointment(appointment.id)} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm
                          </Button>
                        </div>
                      )}

                      {appointment.status === 'confirmed' && (
                        <Button onClick={() => handleCompleteAppointment(appointment.id)} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Completed
                        </Button>
                      )}

                      {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                        <div className="space-y-2">
                          <div className={`${appointment.status === 'completed' ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                            } border rounded - lg p - 3 text - center`}>
                            <span className={`${appointment.status === 'completed' ? 'text-green-700' : 'text-red-700'
                              } font - medium`}>
                              {appointment.status === 'completed' ? '✓ Appointment Completed' : '✗ Appointment Cancelled'}
                            </span>
                          </div>
                          <Button onClick={() => handleDeleteAppointment(appointment.id)} variant="outline" className="w-full text-red-500 hover:bg-red-50 border-red-200">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Record
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {appointments.length === 0 && (
                  <Card className="border-2 border-dashed border-amber-200">
                    <CardContent className="p-12 text-center">
                      <Calendar className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                      <p className="text-gray-600">No appointments found</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification</h2>
                  <p className="text-gray-600">Verify bKash/Nagad payments and track activities</p>
                </div>
              </div>

              <Card className="border-2 border-amber-200">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-amber-600" />
                    Pending Payment Verifications
                  </CardTitle>
                  <CardDescription>Review and verify user payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border-2 border-amber-200 rounded-xl hover:border-amber-400 hover:shadow-md transition-all bg-gradient-to-r from-amber-50/30 to-orange-50/30">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">{payment.type}</Badge>
                            <span className="font-medium text-gray-900">{payment.user}</span>
                          </div>
                          <p className="text-sm text-gray-600">Amount: <span className="font-bold text-amber-600">৳{payment.amount}</span></p>
                          <p className="text-sm text-gray-600">Transaction ID: <span className="font-mono bg-amber-100 px-2 py-1 rounded text-amber-700">{payment.transactionId}</span></p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => {
                            handleVerifyPayment(payment.id);
                          }} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-md">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verify
                          </Button>
                          <Button variant="outline" onClick={() => {
                            handleRejectPayment(payment.id);
                          }} className="border-red-300 text-red-600 hover:bg-red-50">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingPayments.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <DollarSign className="h-12 w-12 text-amber-300 mx-auto mb-2" />
                        <p>No pending payments</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-200">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-amber-600" />
                    Recent Payment Activities
                  </CardTitle>
                  <CardDescription>History of verified and rejected payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paymentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 border border-amber-200 rounded-xl hover:border-amber-300 hover:shadow-sm transition-all">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p - 2 rounded - lg ${activity.action === 'Verified' ? 'bg-green-100' : 'bg-red-100'} `}>
                            {activity.action === 'Verified' ?
                              <CheckCircle className="h-4 w-4 text-green-600" /> :
                              <XCircle className="h-4 w-4 text-red-600" />
                            }
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900">{activity.user}</p>
                              <Badge className={activity.action === 'Verified' ? 'bg-green-500' : 'bg-red-500'}>
                                {activity.action}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{activity.type} • ৳{activity.amount}</p>
                            <p className="text-xs text-gray-600 font-mono">TxID: {activity.transactionId}</p>
                            <p className="text-xs text-amber-600 mt-1">{activity.timestamp}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleDeletePaymentActivity(activity.id)} className="text-red-500 hover:bg-red-50 border-red-200">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {paymentActivities.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-12 w-12 text-amber-300 mx-auto mb-2" />
                        <p>No payment activities yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-200">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-amber-600" />
                        Revenue Analytics
                      </CardTitle>
                      <CardDescription>Track revenue by daily, weekly, and monthly periods</CardDescription>
                    </div>
                    <Select value={revenueFilter} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setRevenueFilter(value)}>
                      <SelectTrigger className="w-40 border-amber-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Calculate filtered payments */}
                    {(() => {
                      const now = new Date();
                      const filteredPayments = payments.filter(p => {
                        if (p.status !== 'verified') return false;
                        const paymentDate = new Date(p.date);

                        if (revenueFilter === 'daily') {
                          return paymentDate.toDateString() === now.toDateString();
                        } else if (revenueFilter === 'weekly') {
                          const weekAgo = new Date(now);
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          return paymentDate >= weekAgo;
                        } else { // monthly
                          return paymentDate.getMonth() === now.getMonth() &&
                            paymentDate.getFullYear() === now.getFullYear();
                        }
                      });

                      const medicineOrders = filteredPayments.filter(p => p.type === 'medicine');
                      const appointments = filteredPayments.filter(p => p.type === 'appointment');

                      const medicineTotal = medicineOrders.reduce((sum, p) => sum + p.amount, 0);
                      const appointmentTotal = appointments.reduce((sum, p) => sum + p.amount, 0);
                      const grandTotal = medicineTotal + appointmentTotal;

                      return (
                        <>
                          {/* Revenue Summary Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Package className="h-4 w-4 text-blue-600" />
                                  <p className="text-sm font-medium text-gray-700">Medicine Orders</p>
                                </div>
                                <p className="text-2xl font-bold text-blue-600 mb-1">
                                  ৳{medicineTotal.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">{medicineOrders.length} orders</p>
                              </CardContent>
                            </Card>

                            <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Calendar className="h-4 w-4 text-green-600" />
                                  <p className="text-sm font-medium text-gray-700">Appointments</p>
                                </div>
                                <p className="text-2xl font-bold text-green-600 mb-1">
                                  ৳{appointmentTotal.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">{appointments.length} appointments</p>
                              </CardContent>
                            </Card>

                            <Card className="border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <DollarSign className="h-4 w-4 text-amber-600" />
                                  <p className="text-sm font-medium text-gray-700">Total Revenue</p>
                                </div>
                                <p className="text-2xl font-bold text-amber-600 mb-1">
                                  ৳{grandTotal.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {revenueFilter === 'daily' ? 'Today' : revenueFilter === 'weekly' ? 'This Week' : 'This Month'}
                                </p>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Detailed Breakdown */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Medicine Orders Breakdown */}
                            <Card className="border border-blue-200">
                              <CardHeader className="bg-blue-50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Package className="h-5 w-5 text-blue-600" />
                                  Medicine Orders Revenue
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Amount:</span>
                                    <span className="text-lg font-bold text-blue-600">৳{medicineTotal.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Number of Orders:</span>
                                    <span className="text-lg font-semibold text-gray-900">{medicineOrders.length}</span>
                                  </div>
                                  <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="text-sm text-gray-600">Average per Order:</span>
                                    <span className="text-lg font-semibold text-gray-900">
                                      ৳{medicineOrders.length > 0 ? Math.round(medicineTotal / medicineOrders.length).toLocaleString() : '0'}
                                    </span>
                                  </div>
                                  {medicineOrders.length > 0 && (
                                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                                      <p className="text-xs font-medium text-gray-500 mb-2">Recent Orders:</p>
                                      {medicineOrders.slice(0, 5).map((order) => (
                                        <div key={order.id} className="flex justify-between text-sm p-2 bg-blue-50 rounded">
                                          <span className="text-gray-700">Order #{order.orderId || order.id.slice(0, 8)}</span>
                                          <span className="font-semibold text-blue-600">৳{order.amount.toLocaleString()}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            {/* Appointments Breakdown */}
                            <Card className="border border-green-200">
                              <CardHeader className="bg-green-50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <Calendar className="h-5 w-5 text-green-600" />
                                  Appointments Revenue
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Amount:</span>
                                    <span className="text-lg font-bold text-green-600">৳{appointmentTotal.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Number of Appointments:</span>
                                    <span className="text-lg font-semibold text-gray-900">{appointments.length}</span>
                                  </div>
                                  <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="text-sm text-gray-600">Average per Appointment:</span>
                                    <span className="text-lg font-semibold text-gray-900">
                                      ৳{appointments.length > 0 ? Math.round(appointmentTotal / appointments.length).toLocaleString() : '0'}
                                    </span>
                                  </div>
                                  {appointments.length > 0 && (
                                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                                      <p className="text-xs font-medium text-gray-500 mb-2">Recent Appointments:</p>
                                      {appointments.slice(0, 5).map((apt) => (
                                        <div key={apt.id} className="flex justify-between text-sm p-2 bg-green-50 rounded">
                                          <span className="text-gray-700">{apt.user}</span>
                                          <span className="font-semibold text-green-600">৳{apt.amount.toLocaleString()}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Prescription Management</h2>
                  <p className="text-gray-600">Review and process prescription uploads from users</p>
                </div>
              </div>

              <div className="grid gap-4">
                {prescriptions.map((prescription) => (
                  <Card key={prescription.id} className={`border-2 ${prescription.status === 'pending' ? 'border-amber-300 bg-amber-50/30' :
                    prescription.status === 'approved' ? 'border-green-300 bg-green-50/30' :
                      'border-red-300 bg-red-50/30'
                    } hover:shadow-xl transition-all`}>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Prescription Image */}
                        <div>
                          <div className="relative group">
                            <img
                              src={prescription.image}
                              alt="Prescription"
                              className="w-full h-64 object-contain rounded-xl border-2 border-amber-200 bg-gray-50 cursor-pointer"
                              onClick={() => setSelectedPrescriptionImage(prescription.image)}
                            />
                            <Button
                              size="sm"
                              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-900"
                              onClick={() => setSelectedPrescriptionImage(prescription.image)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Full
                            </Button>
                          </div>
                        </div>

                        {/* Prescription Details */}
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p - 3 rounded - full ${prescription.status === 'pending' ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                                prescription.status === 'approved' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                                  'bg-gradient-to-br from-red-500 to-rose-500'
                                } `}>
                                <FileText className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-gray-900">{prescription.userName}</h3>
                                  <Badge className={
                                    prescription.status === 'pending' ? 'bg-amber-500' :
                                      prescription.status === 'approved' ? 'bg-green-500' :
                                        'bg-red-500'
                                  }>
                                    {prescription.status.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{prescription.userEmail}</p>
                                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Uploaded: {prescription.uploadDate}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* User Details Card */}
                          <Card className="border border-amber-200 bg-white">
                            <CardContent className="p-4">
                              <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">User ID:</span>
                                  <span className="font-medium">{prescription.userId}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Name:</span>
                                  <span className="font-medium">{prescription.userName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Email:</span>
                                  <span className="font-medium">{prescription.userEmail}</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full mt-3 border-amber-300 text-amber-700 hover:bg-amber-50"
                                onClick={async () => {
                                  setSelectedUserForCart({
                                    userId: prescription.userId,
                                    userName: prescription.userName,
                                    userEmail: prescription.userEmail,
                                  });
                                  console.log('Opening cart for user:', prescription.userId);
                                  // Load user cart from API
                                  try {
                                    const cartData = await cartsAPI.getByUserId(prescription.userId);
                                    setUserCartItems(cartData.items || []);
                                  } catch {
                                    setUserCartItems([]);
                                  }
                                  setShowUserCartDialog(true);
                                }}
                              >
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Manage User Cart
                              </Button>
                            </CardContent>
                          </Card>

                          {/* Action Buttons */}
                          {prescription.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button onClick={() => handleRejectPrescription(prescription.id)} variant="outline" className="flex-1 text-red-600 hover:bg-red-50 border-red-300">
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                              <Button onClick={() => handleApprovePrescription(prescription.id)} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                            </div>
                          )}

                          {prescription.status === 'approved' && (
                            <div className="space-y-2">
                              <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                                <CheckCircle className="h-5 w-5 text-green-600 inline mr-2" />
                                <span className="text-green-700 font-medium">Prescription Approved - Ready to add medicines</span>
                              </div>
                              <Button onClick={() => handleDeletePrescription(prescription.id)} variant="outline" className="w-full text-red-500 hover:bg-red-50 border-red-200">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Record
                              </Button>
                            </div>
                          )}

                          {prescription.status === 'rejected' && (
                            <div className="space-y-2">
                              <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-center">
                                <XCircle className="h-5 w-5 text-red-600 inline mr-2" />
                                <span className="text-red-700 font-medium">Prescription Rejected</span>
                              </div>
                              <Button onClick={() => handleDeletePrescription(prescription.id)} variant="outline" className="w-full text-red-500 hover:bg-red-50 border-red-200">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Record
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {prescriptions.length === 0 && (
                  <Card className="border-2 border-dashed border-amber-200">
                    <CardContent className="p-12 text-center">
                      <FileText className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                      <p className="text-gray-600">No prescription uploads</p>
                      <p className="text-sm text-gray-500 mt-2">Prescription uploads from users will appear here</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Management</h2>
                  <p className="text-gray-600">Manage user reviews for doctors, medicines, and hospitals</p>
                </div>
              </div>

              <Card className="border-2 border-amber-200">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-600" />
                    All Reviews
                  </CardTitle>
                  <CardDescription>Approve, reject, or delete user-submitted reviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            <Star className="h-12 w-12 text-amber-300 mx-auto mb-2" />
                            <p>No reviews found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        reviews.map((review) => (
                          <TableRow key={review._id || review.id}>
                            <TableCell>{review.userName}</TableCell>
                            <TableCell>
                              <span className="capitalize">{review.targetType}</span>
                              {/* Ideally fetching target name here, but ID is what we have for now, or fetch map */}
                            </TableCell>
                            <TableCell>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} `} />
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{review.comment}</TableCell>
                            <TableCell>
                              <Badge className={review.status === 'approved' ? 'bg-green-500' : review.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'}>
                                {review.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {review.status === 'pending' && (
                                  <>
                                    <Button size="sm" onClick={() => handleUpdateReviewStatus(review._id || review.id || '', 'approved')} className="bg-green-500 hover:bg-green-600 text-white">Approve</Button>
                                    <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => handleUpdateReviewStatus(review._id || review.id || '', 'rejected')}>Reject</Button>
                                  </>
                                )}
                                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 border-red-200" onClick={() => handleDeleteReview(review._id || review.id || '')}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'doctors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Doctors</h2>
                  <p className="text-gray-600">Add, edit, or remove doctors</p>
                </div>
                <Button onClick={() => {
                  setEditingDoctor(null);
                  setDoctorForm({ name: '', specialty: '', experience: '', fee: '', rating: '', patients: '', availability: '', image: '' });
                  setShowDoctorForm(true);
                }} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Doctor
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doctor) => (
                  <Card key={doctor.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{doctor.name}</p>
                          <p className="text-sm text-gray-600">{doctor.specialty}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{doctor.experience}+ years</Badge>
                            <span className="text-xs text-gray-500">৳{doctor.fee}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditDoctor(doctor)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:bg-red-50 border-red-200" onClick={() => handleDeleteDoctor(doctor.id)}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add/Edit Doctor Dialog */}
              <Dialog open={showDoctorForm} onOpenChange={(open) => {
                setShowDoctorForm(open);
                if (!open) {
                  setEditingDoctor(null);
                  setDoctorForm({ name: '', specialty: '', experience: '', fee: '', rating: '', patients: '', availability: '', image: '' });
                }
              }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
                    <DialogDescription>
                      {editingDoctor ? 'Update doctor profile and schedule' : 'Create a new doctor profile'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Doctor Name</Label>
                        <Input
                          value={doctorForm.name}
                          onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                          placeholder="Dr. Rahman Ahmed"
                        />
                      </div>
                      <div>
                        <Label>Specialty</Label>
                        <Input
                          value={doctorForm.specialty}
                          onChange={(e) => setDoctorForm({ ...doctorForm, specialty: e.target.value })}
                          placeholder="Cardiologist"
                        />
                      </div>
                      <div>
                        <Label>Experience (years)</Label>
                        <Input
                          type="number"
                          value={doctorForm.experience}
                          onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                          placeholder="15"
                        />
                      </div>
                      <div>
                        <Label>Consultation Fee (৳)</Label>
                        <Input
                          type="number"
                          value={doctorForm.fee}
                          onChange={(e) => setDoctorForm({ ...doctorForm, fee: e.target.value })}
                          placeholder="1200"
                        />
                      </div>
                      <div>
                        <Label>Rating (1-5)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={doctorForm.rating}
                          onChange={(e) => setDoctorForm({ ...doctorForm, rating: e.target.value })}
                          placeholder="4.8"
                        />
                      </div>
                      <div>
                        <Label>Patients Treated</Label>
                        <Input
                          type="number"
                          value={doctorForm.patients}
                          onChange={(e) => setDoctorForm({ ...doctorForm, patients: e.target.value })}
                          placeholder="500"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Availability</Label>
                      <Input
                        value={doctorForm.availability}
                        onChange={(e) => setDoctorForm({ ...doctorForm, availability: e.target.value })}
                        placeholder="Mon-Fri, 9AM-5PM"
                      />
                    </div>
                    <div>
                      <ImageUploadWithCrop
                        currentImage={doctorForm.image}
                        onImageSelected={(image) => setDoctorForm({ ...doctorForm, image })}
                        aspectRatio={1}
                        label="Doctor Photo"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => {
                        setShowDoctorForm(false);
                        setEditingDoctor(null);
                        setDoctorForm({ name: '', specialty: '', experience: '', fee: '', rating: '', patients: '', availability: '', image: '' });
                      }}>
                        Cancel
                      </Button>
                      <Button
                        onClick={editingDoctor ? handleUpdateDoctor : handleAddDoctor}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30"
                      >
                        {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === 'medicines' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Medicines</h2>
                  <p className="text-gray-600">Add, edit, or remove medicines</p>
                </div>
                <Button onClick={() => {
                  setEditingMedicine(null);
                  setMedicineForm({
                    name: '', company: '', type: '', price: '', stock: '', image: '', description: '',
                    genericName: '', manufacturer: '', form: '', strength: ''
                  });
                  setShowMedicineForm(true);
                }} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medicine
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {medicines.map((medicine) => (
                  <Card key={medicine.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <img src={medicine.image} alt={medicine.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                      <p className="font-medium text-gray-900 mb-1">{medicine.name}</p>
                      <p className="text-sm text-gray-600">{medicine.brand}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-amber-600">৳{medicine.price}</span>
                        <Badge className={medicine.inStock ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'}>
                          {medicine.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditMedicine(medicine)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:bg-red-50 border-red-200" onClick={() => handleDeleteMedicine(medicine.id)}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add/Edit Medicine Dialog */}
              <Dialog open={showMedicineForm} onOpenChange={(open) => {
                setShowMedicineForm(open);
                if (!open) {
                  setEditingMedicine(null);
                  setMedicineForm({
                    name: '', company: '', type: '', price: '', stock: '', image: '', description: '',
                    genericName: '', manufacturer: '', form: '', strength: ''
                  });
                }
              }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</DialogTitle>
                    <DialogDescription>
                      {editingMedicine ? 'Update medicine details and inventory' : 'Add a new medicine to the inventory'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Medicine Name</Label>
                        <Input
                          value={medicineForm.name}
                          onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value as string })}
                          placeholder="Napa Extend 665mg"
                        />
                      </div>
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={medicineForm.company}
                          onChange={(e) => setMedicineForm({ ...medicineForm, company: e.target.value })}
                          placeholder="Beximco Pharmaceuticals"
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select value={medicineForm.type} onValueChange={(value) => setMedicineForm({ ...medicineForm, type: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="Tablet">Tablet</SelectItem>
                            <SelectItem value="Capsule">Capsule</SelectItem>
                            <SelectItem value="Syrup">Syrup</SelectItem>
                            <SelectItem value="Injection">Injection</SelectItem>
                            <SelectItem value="Cream">Cream</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Price (৳)</Label>
                        <Input
                          type="number"
                          value={medicineForm.price}
                          onChange={(e) => setMedicineForm({ ...medicineForm, price: e.target.value })}
                          placeholder="80"
                        />
                      </div>
                      <div>
                        <Label>Stock Quantity</Label>
                        <Input
                          type="number"
                          value={medicineForm.stock}
                          onChange={(e) => setMedicineForm({ ...medicineForm, stock: e.target.value })}
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <Label>Generic Name (Required)</Label>
                        <Input
                          value={medicineForm.genericName}
                          onChange={(e) => setMedicineForm({ ...medicineForm, genericName: e.target.value })}
                          placeholder="e.g. Paracetamol"
                        />
                      </div>
                      <div>
                        <Label>Strength</Label>
                        <Input
                          value={medicineForm.strength}
                          onChange={(e) => setMedicineForm({ ...medicineForm, strength: e.target.value })}
                          placeholder="e.g. 500mg"
                        />
                      </div>
                      <div>
                        <Label>Manufacturer</Label>
                        <Input
                          value={medicineForm.manufacturer}
                          onChange={(e) => setMedicineForm({ ...medicineForm, manufacturer: e.target.value })}
                          placeholder="e.g. Acme Laboratories"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={medicineForm.description}
                        onChange={(e) => setMedicineForm({ ...medicineForm, description: e.target.value })}
                        placeholder="Medicine description..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <ImageUploadWithCrop
                        currentImage={medicineForm.image}
                        onImageSelected={(image) => setMedicineForm({ ...medicineForm, image })}
                        aspectRatio={1}
                        label="Medicine Image"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => {
                        setShowMedicineForm(false);
                        setEditingMedicine(null);
                        setMedicineForm({
                          name: '', company: '', type: '', price: '', stock: '', image: '', description: '',
                          genericName: '', manufacturer: '', form: '', strength: ''
                        });
                      }}>
                        Cancel
                      </Button>
                      <Button
                        onClick={editingMedicine ? handleUpdateMedicine : handleAddMedicine}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30"
                      >
                        {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === 'hospitals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Hospitals</h2>
                  <p className="text-gray-600">Add, edit, or remove hospitals</p>
                </div>
                <Button onClick={() => {
                  setEditingHospital(null);
                  setHospitalForm({
                    name: '',
                    address: '',
                    specialty: '',
                    image: '',
                    phone: '',
                    hours: '',
                    description: '',
                    departments: '',
                    facilities: '',
                    beds: '',
                    staff: '',
                    email: '',
                    rating: '4.8'
                  });
                  setShowHospitalForm(true);
                }} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Hospital
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hospitals.map((hospital) => (
                  <Card key={hospital.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <img src={hospital.image} alt={hospital.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                      <p className="font-medium text-gray-900 mb-1">{hospital.name}</p>
                      <p className="text-sm text-gray-600 mb-2">{hospital.address}</p>
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          {hospital.specialty}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditHospital(hospital)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:bg-red-50 border-red-200" onClick={() => handleDeleteHospital(hospital.id)}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add/Edit Hospital Dialog */}
              <Dialog open={showHospitalForm} onOpenChange={(open: boolean) => {
                setShowHospitalForm(open);
                if (!open) {
                  setEditingHospital(null);
                  setHospitalForm({
                    name: '',
                    address: '',
                    specialty: '',
                    image: '',
                    phone: '',
                    hours: '',
                    description: '',
                    departments: '',
                    facilities: '',
                    beds: '',
                    staff: '',
                    email: '',
                    rating: '4.8'
                  });
                }
              }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle>{editingHospital ? 'Edit Hospital' : 'Add New Hospital'}</DialogTitle>
                    <DialogDescription>
                      {editingHospital ? 'Update hospital details and facilities' : 'Add a new hospital to the network'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Hospital Name *</Label>
                        <Input
                          value={hospitalForm.name}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })}
                          placeholder="Square Hospital"
                        />
                      </div>
                      <div>
                        <Label>Specialty *</Label>
                        <Input
                          value={hospitalForm.specialty}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, specialty: e.target.value })}
                          placeholder="Multi-specialty Hospital"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Address *</Label>
                        <Input
                          value={hospitalForm.address}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })}
                          placeholder="18/F, Bir Uttam Qazi Nuruzzaman Sarak, Dhaka 1205"
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={hospitalForm.phone}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })}
                          placeholder="+880 1700-000000"
                        />
                      </div>
                      <div>
                        <Label>Hours</Label>
                        <Input
                          value={hospitalForm.hours}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, hours: e.target.value })}
                          placeholder="24/7 Available"
                        />
                      </div>
                      <div>
                        <Label>Total Beds</Label>
                        <Input
                          value={hospitalForm.beds}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, beds: e.target.value })}
                          placeholder="200+ Beds"
                        />
                      </div>
                      <div>
                        <Label>Staff Count</Label>
                        <Input
                          value={hospitalForm.staff}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, staff: e.target.value })}
                          placeholder="200+ Medical Staff"
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={hospitalForm.email}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, email: e.target.value })}
                          placeholder="info@hospital.com"
                        />
                      </div>
                      <div>
                        <Label>Rating</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          value={hospitalForm.rating}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, rating: e.target.value })}
                          placeholder="4.8"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>About Hospital (Description)</Label>
                      <Textarea
                        value={hospitalForm.description}
                        onChange={(e) => setHospitalForm({ ...hospitalForm, description: e.target.value })}
                        placeholder="Square Hospital is a leading healthcare institution in Bangladesh, providing comprehensive medical services..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label>Departments & Specialties</Label>
                      <Input
                        value={hospitalForm.departments}
                        onChange={(e) => setHospitalForm({ ...hospitalForm, departments: e.target.value })}
                        placeholder="Cardiology, Neurology, Orthopedics, Pediatrics (comma separated)"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter departments separated by commas</p>
                    </div>
                    <div>
                      <Label>Facilities & Services</Label>
                      <Input
                        value={hospitalForm.facilities}
                        onChange={(e) => setHospitalForm({ ...hospitalForm, facilities: e.target.value })}
                        placeholder="24/7 Emergency Service, Modern ICU, Digital X-Ray (comma separated)"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter facilities separated by commas</p>
                    </div>
                    <div>
                      <Label>Hospital Image</Label>
                      <ImageUploadWithCrop
                        currentImage={hospitalForm.image}
                        onImageSelected={(image) => setHospitalForm({ ...hospitalForm, image })}
                        aspectRatio={16 / 9}
                        label="Upload Hospital Image"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => {
                        setShowHospitalForm(false);
                        setEditingHospital(null);
                        setHospitalForm({
                          name: '',
                          address: '',
                          specialty: '',
                          image: '',
                          phone: '',
                          hours: '',
                          description: '',
                          departments: '',
                          facilities: '',
                          beds: '',
                          staff: '',
                          email: '',
                          rating: '4.8'
                        });
                      }}>
                        Cancel
                      </Button>
                      <Button
                        onClick={editingHospital ? handleUpdateHospital : handleAddHospital}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30"
                      >
                        {editingHospital ? 'Update Hospital' : 'Add Hospital'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === 'carousel' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Carousel Manager</h2>
                  <p className="text-gray-600">Manage homepage carousel slides</p>
                </div>
                <Button onClick={() => {
                  setEditingCarousel(null);
                  setCarouselForm({ title: '', subtitle: '', cta: '', image: '', buttonText: 'Get Started', buttonType: 'custom', buttonLink: '', videoType: 'none', videoUrl: '', videoFile: null });
                  setShowCarouselForm(true);
                }} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slide
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {carouselSlides.map((slide) => {
                  console.log('Rendering Slide:', slide.id, slide.videoType, slide.videoUrl);
                  return (
                    <Card key={slide.id} className="overflow-hidden group hover:shadow-xl transition-shadow">
                      <div className="relative h-48 bg-gray-900 group-hover:bg-gray-800 transition-colors">
                        {slide.videoType === 'youtube' && slide.videoUrl ? (
                          <div className="w-full h-full relative">
                            <iframe
                              src={`https://www.youtube.com/embed/${slide.videoUrl.split('v=')[1]?.split('&')[0] || slide.videoUrl.split('youtu.be/')[1]?.split('?')[0]}?controls=0&rel=0`}
                              className="w-full h-full object-cover pointer-events-none"
                              title={slide.title}
                            />
                          </div>
                        ) : slide.videoType === 'upload' && slide.videoUrl ? (
                          <video
                            src={slide.videoUrl}
                            className="w-full h-full object-cover bg-black"
                            muted
                            loop
                            playsInline
                            controls
                            poster={slide.image}
                          />
                        ) : (
                          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                        )}

                        {/* Overlay gradients and text */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                        {/* Video Indicator */}
                        {(slide.videoType === 'youtube' || slide.videoType === 'upload') && (
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 border border-white/20 z-10">
                            {slide.videoType === 'youtube' ? <Youtube className="w-3 h-3 text-red-500" /> : <PlayCircle className="w-3 h-3 text-green-400" />}
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                              {slide.videoType}
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-4 left-4 text-white pointer-events-none">
                          <h3 className="font-bold text-xl mb-1 flex items-center gap-2">
                            {slide.title}
                          </h3>
                          <p className="text-sm text-white/90">{slide.subtitle}</p>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-amber-500">{slide.cta}</Badge>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditCarousel(slide)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteCarousel(slide.id)} className="text-red-500 hover:bg-red-50 border-red-200">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Add/Edit Carousel Dialog */}
              <Dialog open={showCarouselForm} onOpenChange={(open: boolean) => {
                setShowCarouselForm(open);
                if (!open) {
                  setEditingCarousel(null);
                  setCarouselForm({ title: '', subtitle: '', cta: '', image: '', buttonText: 'Get Started', buttonType: 'custom', buttonLink: '', videoType: 'none', videoUrl: '', videoFile: null });
                }
              }}>
                <DialogContent className="max-w-2xl bg-white">
                  <DialogHeader>
                    <DialogTitle>{editingCarousel ? 'Edit Carousel Slide' : 'Add Carousel Slide'}</DialogTitle>
                    <DialogDescription>
                      {editingCarousel ? 'Update banner slide details' : 'Add a new banner slide to the homepage'}
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] md:h-[70vh] pr-4">
                    <div className="space-y-4 pt-4">
                      <div>
                        <Label>Slide Title</Label>
                        <Input
                          value={carouselForm.title}
                          onChange={(e) => setCarouselForm({ ...carouselForm, title: e.target.value })}
                          placeholder="Expert Healthcare"
                        />
                      </div>
                      <div>
                        <Label>Subtitle</Label>
                        <Input
                          value={carouselForm.subtitle}
                          onChange={(e) => setCarouselForm({ ...carouselForm, subtitle: e.target.value })}
                          placeholder="Book appointments with top specialists"
                        />
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Button Configuration</h3>

                        <div>
                          <Label>Button Type</Label>
                          <Select
                            value={carouselForm.buttonType}
                            onValueChange={(value) => setCarouselForm({ ...carouselForm, buttonType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select button type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="order">Order Medicines</SelectItem>
                              <SelectItem value="appointment">Book Appointment</SelectItem>
                              <SelectItem value="hospital">Find Hospital</SelectItem>
                              <SelectItem value="custom">Custom Link</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">
                            {carouselForm.buttonType === 'order' && 'Navigates to Medicines page'}
                            {carouselForm.buttonType === 'appointment' && 'Navigates to Doctors page'}
                            {carouselForm.buttonType === 'hospital' && 'Navigates to Hospitals page'}
                            {carouselForm.buttonType === 'custom' && 'Use your own custom link below'}
                          </p>
                        </div>

                        <div>
                          <Label>Button Text</Label>
                          <Input
                            value={carouselForm.buttonText}
                            onChange={(e) => setCarouselForm({ ...carouselForm, buttonText: e.target.value })}
                            placeholder="Get Started"
                          />
                        </div>

                        {carouselForm.buttonType === 'custom' && (
                          <div>
                            <Label>Custom Link</Label>
                            <Input
                              value={carouselForm.buttonLink}
                              onChange={(e) => setCarouselForm({ ...carouselForm, buttonLink: e.target.value })}
                              placeholder="/services or https://example.com"
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter a relative path (/page) or full URL (https://...)</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <Separator />
                        <h3 className="text-lg font-semibold text-gray-900">Media Content</h3>

                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <Label className="mb-2 block">
                              Slide Background Image
                              {carouselForm.videoType !== 'none' ? ' (Optional - Check video thumbnail)' : ' (Required)'}
                            </Label>
                            <ImageUploadWithCrop
                              currentImage={carouselForm.image}
                              onImageSelected={(image) => setCarouselForm({ ...carouselForm, image })}
                              aspectRatio={16 / 9}
                              label="Slide Image (1200x400 recommended)"
                            />
                            <p className="text-xs text-gray-500 mt-1">This image will be shown on mobile or if video fails to load.</p>
                          </div>

                          <div className="pt-2">
                            <Label className="mb-2 block">Background Video (Optional)</Label>
                            <Tabs defaultValue={carouselForm.videoType === 'none' ? 'none' : carouselForm.videoType} onValueChange={(val) => {
                              if (val === 'none') setCarouselForm({ ...carouselForm, videoType: 'none', videoUrl: '', videoFile: null });
                              else if (val === 'youtube') setCarouselForm({ ...carouselForm, videoType: 'youtube', videoUrl: '', videoFile: null });
                              else if (val === 'upload') setCarouselForm({ ...carouselForm, videoType: 'upload', videoUrl: '', videoFile: null });
                            }} className="w-full">
                              <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="none">No Video</TabsTrigger>
                                <TabsTrigger value="youtube">YouTube</TabsTrigger>
                                <TabsTrigger value="upload">Upload Video</TabsTrigger>
                              </TabsList>

                              <TabsContent value="none" className="mt-0">
                                <div className="p-4 border border-dashed rounded-lg bg-gray-50 text-center text-gray-500 text-sm">
                                  Static image will be displayed.
                                </div>
                              </TabsContent>

                              <TabsContent value="youtube" className="mt-0">
                                <Card className="p-4 border-amber-100 bg-amber-50/30">
                                  <Label className="mb-2 block flex items-center gap-2">
                                    <Youtube className="w-4 h-4 text-red-600" />
                                    YouTube Video URL
                                  </Label>
                                  <Input
                                    value={carouselForm.videoType === 'youtube' ? carouselForm.videoUrl : ''}
                                    onChange={(e) => setCarouselForm({ ...carouselForm, videoType: 'youtube', videoUrl: e.target.value })}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="bg-white"
                                  />
                                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <Activity className="w-3 h-3" />
                                    Video will play silently in the background
                                  </p>
                                </Card>
                              </TabsContent>

                              <TabsContent value="upload" className="mt-0">
                                <Card className="p-4 border-blue-100 bg-blue-50/30">
                                  <Label className="mb-2 block flex items-center gap-2">
                                    <Upload className="w-4 h-4 text-blue-600" />
                                    Upload Video File
                                  </Label>
                                  <Input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setCarouselForm({ ...carouselForm, videoType: 'upload', videoFile: file });
                                      }
                                    }}
                                    className="cursor-pointer bg-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                  />
                                  {carouselForm.videoType === 'upload' && carouselForm.videoUrl && !carouselForm.videoFile && (
                                    <div className="mt-2 text-xs text-green-600 flex items-center gap-1 bg-green-50 p-2 rounded">
                                      <CheckCircle className="w-3 h-3" />
                                      Current video uploaded
                                    </div>
                                  )}
                                  <p className="text-xs text-gray-500 mt-2">Max duration: 10-20 seconds recommended (MP4/WebM)</p>
                                </Card>
                              </TabsContent>
                            </Tabs>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => {
                      setShowCarouselForm(false);
                      setEditingCarousel(null);
                      setCarouselForm({ title: '', subtitle: '', cta: '', image: '', buttonText: 'Get Started', buttonType: 'custom', buttonLink: '', videoType: 'none', videoUrl: '', videoFile: null });
                    }}>
                      Cancel
                    </Button>
                    <Button
                      onClick={editingCarousel ? handleUpdateCarousel : handleAddCarousel}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30"
                    >
                      {editingCarousel ? 'Update Slide' : 'Add Slide'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )
          }

          {
            activeTab === 'messages' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Live Messages</h2>
                  <p className="text-gray-600">Chat with users in real-time</p>
                </div>

                <div className="grid gap-4">
                  {liveMessages.map((message) => (
                    <Card key={message.id} className={`border-2 ${message.status === 'unread' ? 'border-amber-300 bg-amber-50/50' : 'border-gray-200'} hover:shadow-xl transition-all`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-full">
                              <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900">{message.userName}</h3>
                                {message.status === 'unread' && (
                                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">New</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{message.userEmail}</p>
                              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {message.timestamp}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {message.status === 'unread' && (
                              <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(message.id)} className="text-amber-600 hover:bg-amber-50">
                                Mark as Read
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => setLiveMessages(prev => prev.filter(m => m.id !== message.id))} className="text-red-500 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* User Message */}
                        <div className="bg-white border border-amber-200 rounded-xl p-4 mb-4">
                          <p className="text-gray-800">{message.message}</p>
                        </div>

                        {/* Previous Replies */}
                        {message.replies.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {message.replies.map((reply: any, idx: number) => (
                              <div key={idx} className={`${reply.admin ? 'bg-gradient-to-r from-amber-100 to-orange-100 ml-8' : 'bg-gray-100 mr-8'} rounded - xl p - 4`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={reply.admin ? 'bg-amber-600' : 'bg-gray-600'}>
                                    {reply.admin ? 'Admin' : 'User'}
                                  </Badge>
                                  <span className="text-xs text-gray-600">{reply.timestamp}</span>
                                </div>
                                <p className="text-gray-800">{reply.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply Section */}
                        {activeMessageId === message.id ? (
                          <div className="space-y-3">
                            <Textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your reply..."
                              className="border-amber-300 focus:border-amber-500"
                              rows={3}
                            />
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => { setActiveMessageId(null); setReplyText(''); }}>
                                Cancel
                              </Button>
                              <Button onClick={() => { handleSendMessage(message.id); setActiveMessageId(null); }} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30">
                                <Send className="h-4 w-4 mr-2" />
                                Send Reply
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button onClick={() => setActiveMessageId(message.id)} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30">
                            <Send className="h-4 w-4 mr-2" />
                            Reply to {message.userName}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {liveMessages.length === 0 && (
                    <Card className="border-2 border-dashed border-amber-200">
                      <CardContent className="p-12 text-center">
                        <MessageSquare className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                        <p className="text-gray-600">No messages yet</p>
                        <p className="text-sm text-gray-500 mt-2">When users request live chat, their messages will appear here</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )
          }

          {
            activeTab === 'refunds' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Refund Requests</h2>
                  <p className="text-gray-600">Review and process refund requests</p>
                </div>

                <div className="grid gap-4">
                  {refundRequests.map((request) => (
                    <Card key={request.id} className={`border-2 ${request.status === 'pending' ? 'border-amber-300 bg-amber-50/30' :
                      request.status === 'approved' ? 'border-green-300 bg-green-50/30' :
                        'border-red-300 bg-red-50/30'
                      } hover:shadow-xl transition-all`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-gray-900 font-medium">{request.userName}</h3>
                              <Badge variant="outline">{request.orderType}</Badge>
                            </div>
                            <p className="text-sm text-gray-500">Order #{request.orderId}</p>
                            <p className="text-sm text-gray-500">Date: {request.requestDate}</p>
                            {request.refundMethod && (
                              <div className="mt-2 text-sm">
                                <p className="text-gray-600">
                                  <span className="font-medium">Refund To:</span> <span className="capitalize">{request.refundMethod}</span>
                                </p>
                                <p className="text-gray-600">
                                  <span className="font-medium">Number:</span> {request.refundNumber}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge className={
                              request.status === 'approved' ? 'bg-green-100 text-green-700' :
                                request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  'bg-amber-100 text-amber-700'
                            }>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                            <p className="text-2xl font-bold text-amber-600 mt-2">৳{request.amount}</p>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="bg-white border border-amber-200 rounded-xl p-4 mb-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order Type:</span>
                            <span className="font-medium">{request.orderType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order ID:</span>
                            <span className="font-medium">{request.orderId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="font-medium text-amber-600">{request.transactionId}</span>
                          </div>
                          <Separator />
                          <div>
                            <span className="text-gray-600 block mb-1">Reason:</span>
                            <p className="text-gray-900 font-medium">{request.reason}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button onClick={() => handleRejectRefund(request.id)} variant="outline" className="flex-1 text-red-600 hover:bg-red-50 border-red-300">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Refund
                            </Button>
                            <Button onClick={() => handleApproveRefund(request.id)} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/30">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve & Process
                            </Button>
                          </div>
                        )}

                        {request.status === 'approved' && (
                          <div className="space-y-2">
                            <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                              <CheckCircle className="h-5 w-5 text-green-600 inline mr-2" />
                              <span className="text-green-700 font-medium">Refund Approved - Amount will be processed to user's bKash/Nagad</span>
                            </div>
                            <Button onClick={() => handleDeleteRefund(request.id)} variant="outline" className="w-full text-red-500 hover:bg-red-50 border-red-200">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Record
                            </Button>
                          </div>
                        )}

                        {request.status === 'rejected' && (
                          <div className="space-y-2">
                            <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-center">
                              <XCircle className="h-5 w-5 text-red-600 inline mr-2" />
                              <span className="text-red-700 font-medium">Refund Request Rejected</span>
                            </div>
                            <Button onClick={() => handleDeleteRefund(request.id)} variant="outline" className="w-full text-red-500 hover:bg-red-50 border-red-200">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Record
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {refundRequests.length === 0 && (
                    <Card className="border-2 border-dashed border-amber-200">
                      <CardContent className="p-12 text-center">
                        <RotateCcw className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                        <p className="text-gray-600">No refund requests</p>
                        <p className="text-sm text-gray-500 mt-2">Refund requests from users will appear here</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )
          }

          {
            activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
                  <p className="text-gray-600">Configure platform settings</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Configuration</CardTitle>
                    <CardDescription>Manage global platform settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Platform Name</Label>
                      <Input defaultValue="Jeevita" />
                    </div>
                    <div>
                      <Label>Admin Email</Label>
                      <Input defaultValue="admin@jeevita.com" type="email" />
                    </div>
                    <div>
                      <Label>Support Phone</Label>
                      <Input defaultValue="01625691878" />
                    </div>
                    <div>
                      <Label>bKash Number</Label>
                      <Input defaultValue="01625691878" />
                    </div>
                    <Separator />
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30">
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Charges</CardTitle>
                    <CardDescription>Set delivery charges for different locations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Inside Dhaka City (BDT)</Label>
                      <Input
                        type="number"
                        id="dhakaDelivery"
                        value={deliveryChargeDhaka}
                        onChange={(e) => setDeliveryChargeDhaka(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Delivery charge for orders within Dhaka city</p>
                    </div>
                    <div>
                      <Label>Outside Dhaka City (BDT)</Label>
                      <Input
                        type="number"
                        id="outsideDhakaDelivery"
                        value={deliveryChargeOutside}
                        onChange={(e) => setDeliveryChargeOutside(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Delivery charge for orders outside Dhaka city</p>
                    </div>
                    <Button
                      onClick={async () => {
                        try {
                          await Promise.all([
                            settingsAPI.set('deliveryChargeDhaka', deliveryChargeDhaka),
                            settingsAPI.set('deliveryChargeOutside', deliveryChargeOutside),
                          ]);
                          toast.success('Delivery charges updated successfully!');
                        } catch (error) {
                          toast.error('Failed to update delivery charges');
                        }
                      }}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30"
                    >
                      Save Delivery Charges
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Links</CardTitle>
                    <CardDescription>Manage social media links displayed in the footer</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Facebook URL</Label>
                      <Input
                        type="url"
                        id="facebookLink"
                        value={socialLinks.facebook}
                        onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                        placeholder="https://facebook.com/yourpage"
                      />
                      <p className="text-xs text-gray-500 mt-1">Full URL to your Facebook page</p>
                    </div>
                    <div>
                      <Label>Instagram URL</Label>
                      <Input
                        type="url"
                        id="instagramLink"
                        value={socialLinks.instagram}
                        onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                        placeholder="https://instagram.com/yourprofile"
                      />
                      <p className="text-xs text-gray-500 mt-1">Full URL to your Instagram profile</p>
                    </div>
                    <div>
                      <Label>LinkedIn URL</Label>
                      <Input
                        type="url"
                        id="linkedinLink"
                        value={socialLinks.linkedin}
                        onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                      <p className="text-xs text-gray-500 mt-1">Full URL to your LinkedIn page</p>
                    </div>
                    <Button
                      onClick={async () => {
                        try {
                          await settingsAPI.set('socialMediaLinks', socialLinks);
                          toast.success('Social media links updated successfully!');
                        } catch (error) {
                          toast.error('Failed to update social media links');
                        }
                      }}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30"
                    >
                      Save Social Media Links
                    </Button>
                  </CardContent>
                </Card>

                {/* Powered by Jeevita */}
                <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/30">
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-4 rounded-2xl shadow-lg">
                        <Heart className="h-10 w-10 text-white fill-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent mb-2">
                          Powered by Jeevita
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Healthcare Management Platform
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          © 2025 Jeevita. All rights reserved.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          }
        </main >
      </div >

      {/* Prescription Full Image Dialog */}
      < Dialog open={!!selectedPrescriptionImage
      } onOpenChange={() => setSelectedPrescriptionImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Prescription Full View</DialogTitle>
            <DialogDescription>View the complete prescription image</DialogDescription>
          </DialogHeader>
          {selectedPrescriptionImage && (
            <div className="flex justify-center">
              <img
                src={selectedPrescriptionImage}
                alt="Prescription Full View"
                className="max-w-full h-auto rounded-lg border-2 border-amber-200"
              />
            </div>
          )}
        </DialogContent>
      </Dialog >

      {/* User Cart Management Dialog */}
      < Dialog open={showUserCartDialog} onOpenChange={setShowUserCartDialog} >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Manage User Cart - {selectedUserForCart?.userName}</DialogTitle>
            <DialogDescription>
              Add medicines from prescription to user's cart. User: {selectedUserForCart?.userEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Current Cart Items */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Current Cart Items</h3>
              {userCartItems.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userCartItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} × ৳{item.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-600">৳{(item.price * item.quantity).toFixed(2)}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            const updated = userCartItems.filter((_, i) => i !== idx);
                            setUserCartItems(updated);
                            if (selectedUserForCart) {
                              try {
                                await cartsAPI.update(selectedUserForCart.userId, updated);
                              } catch (error) {
                                console.error('Error updating cart:', error);
                              }
                            }
                            toast.success('Item removed from cart');
                          }}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg border border-gray-200">
                  Cart is empty
                </p>
              )}
            </div>

            <Separator />

            {/* Add Medicines to Cart */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Add Medicines to Cart</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {medicines.map((medicine) => {
                  const inCart = userCartItems.find(item => item.id === medicine.id);
                  return (
                    <div key={medicine.id} className="flex items-center justify-between p-3 bg-white border border-amber-200 rounded-lg hover:border-amber-300 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <img src={medicine.image} alt={medicine.name} className="w-12 h-12 object-cover rounded" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{medicine.name}</p>
                          <p className="text-xs text-gray-600">{medicine.brand}</p>
                          <p className="text-sm font-bold text-amber-600">৳{medicine.price}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={async () => {
                          const cartItem = {
                            id: medicine.id,
                            name: medicine.name,
                            price: medicine.price,
                            quantity: inCart ? inCart.quantity + 1 : 1,
                            image: medicine.image,
                          };
                          let updated;
                          if (inCart) {
                            updated = userCartItems.map(item =>
                              item.id === medicine.id ? cartItem : item
                            );
                          } else {
                            updated = [...userCartItems, cartItem];
                          }
                          setUserCartItems(updated);
                          if (selectedUserForCart) {
                            try {
                              console.log('Admin updating cart for user:', selectedUserForCart.userId);
                              console.log('New cart items:', updated);
                              await cartsAPI.update(selectedUserForCart.userId, updated);
                              toast.success(`${medicine.name} added to cart`);
                            } catch (error) {
                              console.error('Error updating cart:', error);
                              toast.error('Failed to update cart');
                            }
                          }
                        }}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowUserCartDialog(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  toast.success(`Cart updated for ${selectedUserForCart?.userName}`);
                  setShowUserCartDialog(false);
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog >
    </div >
  );
}
