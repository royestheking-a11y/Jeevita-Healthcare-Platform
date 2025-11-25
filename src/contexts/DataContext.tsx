import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { mockDoctors, mockMedicines, mockHospitals } from '../data/mockData';
import {
  doctorsAPI, medicinesAPI, hospitalsAPI, appointmentsAPI,
  prescriptionsAPI, paymentsAPI, carouselAPI, activitiesAPI, refundsAPI
} from '../utils/api';

// Types
export interface Doctor {
  _id?: string;
  id: string;
  name: string;
  specialty: string;
  degrees: string;
  experience: number;
  rating: number;
  image: string;
  location: string;
  fee: number;
  availability: string[];
  timeSlots: string[];
}

export interface Medicine {
  _id?: string;
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
}

export interface Hospital {
  _id?: string;
  id: string;
  name: string;
  address: string;
  specialty: string;
  image: string;
  phone?: string;
  hours?: string;
  description?: string;
  departments?: string[];
  facilities?: string[];
  beds?: string;
  staff?: string;
  email?: string;
  rating?: number;
}

export interface Appointment {
  _id?: string;
  id: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  transactionId: string;
  consultType: string;
}

export interface Prescription {
  _id?: string;
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  image: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadDate: string;
  notes?: string;
}

export interface Payment {
  _id?: string;
  id: string;
  user: string;
  userEmail: string;
  type: 'appointment' | 'medicine';
  amount: number;
  transactionId: string;
  status: 'pending' | 'verified' | 'rejected';
  date: string;
  timestamp: string;
  orderId?: string;
  paymentMethod?: 'cod' | 'bkash';
  address?: any;
  items?: any[];
  deliveryFee?: number;
  orderStatus?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'rejected';
}

export interface CarouselSlide {
  _id?: string;
  id: string;
  image: string;
  title: string;
  subtitle: string;
  cta: string;
}

export interface UserActivity {
  _id?: string;
  id: string;
  userName: string;
  email: string;
  action: string;
  timestamp: string;
  type: 'appointment' | 'order' | 'cancellation';
}

interface DataContextType {
  // Data
  loading: boolean;
  doctors: Doctor[];
  medicines: Medicine[];
  hospitals: Hospital[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  payments: Payment[];
  carouselSlides: CarouselSlide[];
  userActivities: UserActivity[];

  // Doctor methods
  addDoctor: (doctor: Omit<Doctor, 'id'>) => Promise<void>;
  updateDoctor: (id: string, doctor: Partial<Doctor>) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;

  // Medicine methods
  addMedicine: (medicine: Omit<Medicine, 'id'>) => Promise<void>;
  updateMedicine: (id: string, medicine: Partial<Medicine>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;

  // Hospital methods
  addHospital: (hospital: Omit<Hospital, 'id'>) => Promise<void>;
  updateHospital: (id: string, hospital: Partial<Hospital>) => Promise<void>;
  deleteHospital: (id: string) => Promise<void>;

  // Appointment methods
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  // Prescription methods
  addPrescription: (prescription: Omit<Prescription, 'id'>) => Promise<void>;
  updatePrescription: (id: string, prescription: Partial<Prescription>) => Promise<void>;
  deletePrescription: (id: string) => Promise<void>;

  // Payment methods
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;

  // Carousel methods
  addCarouselSlide: (slide: Omit<CarouselSlide, 'id'>) => Promise<void>;
  updateCarouselSlide: (id: string, slide: Partial<CarouselSlide>) => Promise<void>;
  deleteCarouselSlide: (id: string) => Promise<void>;

  // Activity methods
  addUserActivity: (activity: Omit<UserActivity, 'id'>) => Promise<void>;
  deleteUserActivity: (id: string) => Promise<void>;

  // Refund methods
  addRefundRequest: (refund: any) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper to convert MongoDB _id to id
const normalizeId = <T extends { _id?: string; id?: string }>(item: T): T & { id: string } => {
  return {
    ...item,
    id: item._id || item.id || '',
  } as T & { id: string };
};

// Helper to normalize array
const normalizeArray = <T extends { _id?: string; id?: string }>(items: T[]): (T & { id: string })[] => {
  return items.map(normalizeId);
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth(); // Import useAuth to check login status

  // Load public data on mount
  useEffect(() => {
    const loadPublicData = async () => {
      try {
        setLoading(true);
        // Fetch public data in parallel
        const [doctorsData, medicinesData, hospitalsData, carouselData] = await Promise.all([
          doctorsAPI.getAll().catch(() => mockDoctors.map(d => ({ ...d, _id: d.id }))),
          medicinesAPI.getAll().catch(() => mockMedicines.map(m => ({ ...m, _id: m.id }))),
          hospitalsAPI.getAll().catch(() => mockHospitals.map(h => ({ ...h, _id: h.id }))),
          carouselAPI.getAll().catch(() => [
            { _id: '1', id: '1', image: 'https://images.unsplash.com/photo-1666886573230-2b730505f298?w=1200', title: 'Expert Healthcare', subtitle: 'Book appointments with top specialists', cta: 'Find Doctors' },
            { _id: '2', id: '2', image: 'https://images.unsplash.com/photo-1596522016734-8e6136fe5cfa?w=1200', title: 'Fast Medicine Delivery', subtitle: 'Order medicines online', cta: 'Order Now' },
          ]),
        ]);

        setDoctors(normalizeArray(doctorsData));
        setMedicines(normalizeArray(medicinesData));
        setHospitals(normalizeArray(hospitalsData));
        setCarouselSlides(normalizeArray(carouselData));
      } catch (error) {
        console.error('Error loading public data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPublicData();
  }, []);

  // Load private data when user changes
  useEffect(() => {
    const loadPrivateData = async () => {
      if (!user) {
        // Clear private data on logout
        setAppointments([]);
        setPrescriptions([]);
        setPayments([]);
        setUserActivities([]);
        return;
      }

      try {
        // Fetch private data in parallel
        const [appointmentsData, prescriptionsData, paymentsData, activitiesData] = await Promise.all([
          appointmentsAPI.getAll().catch(() => []),
          prescriptionsAPI.getAll().catch(() => []),
          paymentsAPI.getAll().catch(() => []),
          activitiesAPI.getAll().catch(() => []),
        ]);

        setAppointments(normalizeArray(appointmentsData));
        setPrescriptions(normalizeArray(prescriptionsData));
        setPayments(normalizeArray(paymentsData));
        setUserActivities(normalizeArray(activitiesData));
      } catch (error) {
        console.error('Error loading private data:', error);
      }
    };

    loadPrivateData();
  }, [user]);

  // Doctor methods
  const addDoctor = async (doctor: Omit<Doctor, 'id'>) => {
    try {
      const newDoctor = await doctorsAPI.create(doctor);
      const normalized = normalizeId(newDoctor);
      setDoctors(prev => [...prev, normalized]);
    } catch (error) {
      console.error('Error adding doctor:', error);
      throw error;
    }
  };

  const updateDoctor = async (id: string, updates: Partial<Doctor>) => {
    try {
      // Find the MongoDB _id if id is used
      const doctor = doctors.find(d => d.id === id || d._id === id);
      const mongoId = doctor?._id || id;

      const updated = await doctorsAPI.update(mongoId, updates);
      const normalized = normalizeId(updated);
      setDoctors(prev => prev.map(d => (d.id === id || d._id === id) ? normalized : d));
    } catch (error) {
      console.error('Error updating doctor:', error);
      throw error;
    }
  };

  const deleteDoctor = async (id: string) => {
    try {
      const doctor = doctors.find(d => d.id === id || d._id === id);
      const mongoId = doctor?._id || id;
      await doctorsAPI.delete(mongoId);
      setDoctors(prev => prev.filter(d => d.id !== id && d._id !== id));
    } catch (error) {
      console.error('Error deleting doctor:', error);
      throw error;
    }
  };

  // Medicine methods
  const addMedicine = async (medicine: Omit<Medicine, 'id'>) => {
    try {
      const newMedicine = await medicinesAPI.create(medicine);
      const normalized = normalizeId(newMedicine);
      setMedicines(prev => [...prev, normalized]);
    } catch (error) {
      console.error('Error adding medicine:', error);
      throw error;
    }
  };

  const updateMedicine = async (id: string, updates: Partial<Medicine>) => {
    try {
      const medicine = medicines.find(m => m.id === id || m._id === id);
      const mongoId = medicine?._id || id;
      const updated = await medicinesAPI.update(mongoId, updates);
      const normalized = normalizeId(updated);
      setMedicines(prev => prev.map(m => (m.id === id || m._id === id) ? normalized : m));
    } catch (error) {
      console.error('Error updating medicine:', error);
      throw error;
    }
  };

  const deleteMedicine = async (id: string) => {
    try {
      const medicine = medicines.find(m => m.id === id || m._id === id);
      const mongoId = medicine?._id || id;
      await medicinesAPI.delete(mongoId);
      setMedicines(prev => prev.filter(m => m.id !== id && m._id !== id));
    } catch (error) {
      console.error('Error deleting medicine:', error);
      throw error;
    }
  };

  // Hospital methods
  const addHospital = async (hospital: Omit<Hospital, 'id'>) => {
    try {
      const newHospital = await hospitalsAPI.create(hospital);
      const normalized = normalizeId(newHospital);
      setHospitals(prev => [...prev, normalized]);
    } catch (error) {
      console.error('Error adding hospital:', error);
      throw error;
    }
  };

  const updateHospital = async (id: string, updates: Partial<Hospital>) => {
    try {
      const hospital = hospitals.find(h => h.id === id || h._id === id);
      const mongoId = hospital?._id || id;
      const updated = await hospitalsAPI.update(mongoId, updates);
      const normalized = normalizeId(updated);
      setHospitals(prev => prev.map(h => (h.id === id || h._id === id) ? normalized : h));
    } catch (error) {
      console.error('Error updating hospital:', error);
      throw error;
    }
  };

  const deleteHospital = async (id: string) => {
    try {
      const hospital = hospitals.find(h => h.id === id || h._id === id);
      const mongoId = hospital?._id || id;
      await hospitalsAPI.delete(mongoId);
      setHospitals(prev => prev.filter(h => h.id !== id && h._id !== id));
    } catch (error) {
      console.error('Error deleting hospital:', error);
      throw error;
    }
  };

  // Appointment methods
  const addAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    try {
      const newAppointment = await appointmentsAPI.create(appointment);
      const normalized = normalizeId(newAppointment);
      setAppointments(prev => [...prev, normalized]);

      // Add user activity
      await addUserActivity({
        userName: appointment.patientName,
        email: appointment.patientEmail,
        action: `Booked appointment with ${appointment.doctorName}`,
        timestamp: new Date().toLocaleString(),
        type: 'appointment',
      });
    } catch (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const appointment = appointments.find(a => a.id === id || a._id === id);
      const mongoId = appointment?._id || id;
      const updated = await appointmentsAPI.update(mongoId, updates);
      const normalized = normalizeId(updated);
      setAppointments(prev => prev.map(a => (a.id === id || a._id === id) ? normalized : a));
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const appointment = appointments.find(a => a.id === id || a._id === id);
      const mongoId = appointment?._id || id;
      await appointmentsAPI.delete(mongoId);
      setAppointments(prev => prev.filter(a => a.id !== id && a._id !== id));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  };

  // Prescription methods
  const addPrescription = async (prescription: Omit<Prescription, 'id'>) => {
    try {
      const newPrescription = await prescriptionsAPI.create(prescription);
      const normalized = normalizeId(newPrescription);
      setPrescriptions(prev => [...prev, normalized]);
    } catch (error) {
      console.error('Error adding prescription:', error);
      throw error;
    }
  };

  const updatePrescription = async (id: string, updates: Partial<Prescription>) => {
    try {
      const prescription = prescriptions.find(p => p.id === id || p._id === id);
      const mongoId = prescription?._id || id;
      const updated = await prescriptionsAPI.update(mongoId, updates);
      const normalized = normalizeId(updated);
      setPrescriptions(prev => prev.map(p => (p.id === id || p._id === id) ? normalized : p));
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw error;
    }
  };

  const deletePrescription = async (id: string) => {
    try {
      const prescription = prescriptions.find(p => p.id === id || p._id === id);
      const mongoId = prescription?._id || id;
      await prescriptionsAPI.delete(mongoId);
      setPrescriptions(prev => prev.filter(p => p.id !== id && p._id !== id));
    } catch (error) {
      console.error('Error deleting prescription:', error);
      throw error;
    }
  };

  // Payment methods
  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    try {
      const newPayment = await paymentsAPI.create(payment);
      const normalized = normalizeId(newPayment);
      setPayments(prev => [...prev, normalized]);
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  };

  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    try {
      const payment = payments.find(p => p.id === id || p._id === id);
      const mongoId = payment?._id || id;
      const updated = await paymentsAPI.update(mongoId, updates);
      const normalized = normalizeId(updated);
      setPayments(prev => prev.map(p => (p.id === id || p._id === id) ? normalized : p));
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  };

  const deletePayment = async (id: string) => {
    try {
      const payment = payments.find(p => p.id === id || p._id === id);
      const mongoId = payment?._id || id;
      await paymentsAPI.delete(mongoId);
      setPayments(prev => prev.filter(p => p.id !== id && p._id !== id));
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  };

  // Carousel methods
  const addCarouselSlide = async (slide: Omit<CarouselSlide, 'id'>) => {
    try {
      const newSlide = await carouselAPI.create(slide);
      const normalized = normalizeId(newSlide);
      setCarouselSlides(prev => [...prev, normalized]);
    } catch (error) {
      console.error('Error adding carousel slide:', error);
      throw error;
    }
  };

  const updateCarouselSlide = async (id: string, updates: Partial<CarouselSlide>) => {
    try {
      const slide = carouselSlides.find(s => s.id === id || s._id === id);
      const mongoId = slide?._id || id;
      const updated = await carouselAPI.update(mongoId, updates);
      const normalized = normalizeId(updated);
      setCarouselSlides(prev => prev.map(s => (s.id === id || s._id === id) ? normalized : s));
    } catch (error) {
      console.error('Error updating carousel slide:', error);
      throw error;
    }
  };

  const deleteCarouselSlide = async (id: string) => {
    try {
      const slide = carouselSlides.find(s => s.id === id || s._id === id);
      const mongoId = slide?._id || id;
      await carouselAPI.delete(mongoId);
      setCarouselSlides(prev => prev.filter(s => s.id !== id && s._id !== id));
    } catch (error) {
      console.error('Error deleting carousel slide:', error);
      throw error;
    }
  };

  // Activity methods
  const addUserActivity = async (activity: Omit<UserActivity, 'id'>) => {
    try {
      const newActivity = await activitiesAPI.create(activity);
      const normalized = normalizeId(newActivity);
      setUserActivities(prev => [...prev, normalized]);
    } catch (error) {
      console.error('Error adding user activity:', error);
      throw error;
    }
  };

  const deleteUserActivity = async (id: string) => {
    try {
      const activity = userActivities.find(a => a.id === id || a._id === id);
      const mongoId = activity?._id || id;
      await activitiesAPI.delete(mongoId);
      setUserActivities(prev => prev.filter(a => a.id !== id && a._id !== id));
    } catch (error) {
      console.error('Error deleting user activity:', error);
      throw error;
    }
  };

  // Refund methods
  const addRefundRequest = async (refund: any) => {
    try {
      await refundsAPI.create(refund);
    } catch (error) {
      console.error('Error adding refund request:', error);
      throw error;
    }
  };

  const value: DataContextType = {
    loading,
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
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addPrescription,
    updatePrescription,
    deletePrescription,
    addPayment,
    updatePayment,
    deletePayment,
    addCarouselSlide,
    updateCarouselSlide,
    deleteCarouselSlide,
    addUserActivity,
    deleteUserActivity,
    addRefundRequest,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
