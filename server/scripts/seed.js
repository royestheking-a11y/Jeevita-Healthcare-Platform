import { connectDB } from '../config/database.js';
import { Doctor } from '../models/Doctor.js';
import { Medicine } from '../models/Medicine.js';
import { Hospital } from '../models/Hospital.js';
import { User } from '../models/User.js';
import { Appointment } from '../models/Appointment.js';
import { Prescription } from '../models/Prescription.js';
import { Payment } from '../models/Payment.js';
import { CarouselSlide } from '../models/CarouselSlide.js';
import { UserActivity } from '../models/UserActivity.js';
import { Message } from '../models/Message.js';
import { RefundRequest } from '../models/RefundRequest.js';
import { Cart } from '../models/Cart.js';
import { Settings } from '../models/Settings.js';
import {
  mockDoctors,
  mockMedicines,
  mockHospitals,
  mockUsers,
  mockMessages,
  mockRefundRequests,
  mockAppointments,
  mockPrescriptions,
  mockPayments,
  mockCarouselSlides,
  mockUserActivities,
  mockCarts,
  mockSettings,
} from '../data/mockData.js';

const seedIfEmpty = async (Model, data, label) => {
  const count = await Model.countDocuments();
  if (count === 0 && data.length) {
    await Model.insertMany(data);
    console.log(`✅ Seeded ${label} (${data.length})`);
  } else {
    console.log(`ℹ️ ${label} already has ${count} records, skipping`);
  }
};

const run = async () => {
  try {
    await connectDB();

    // Base collections
    await seedIfEmpty(Doctor, mockDoctors, 'Doctors');
    const doctors = await Doctor.find();
    const doctorLookup = {};
    doctors.forEach(doc => {
      doctorLookup[doc.name] = doc;
    });

    await seedIfEmpty(Medicine, mockMedicines, 'Medicines');
    await seedIfEmpty(Hospital, mockHospitals, 'Hospitals');

    // Users
    await seedIfEmpty(User, mockUsers, 'Users');
    const users = await User.find();
    const userLookup = {};
    users.forEach(user => {
      userLookup[user.email] = user;
    });

    // Messages & refunds
    await seedIfEmpty(Message, mockMessages, 'Messages');
    await seedIfEmpty(RefundRequest, mockRefundRequests, 'Refund Requests');

    // Carousel
    await seedIfEmpty(CarouselSlide, mockCarouselSlides, 'Carousel Slides');

    // Appointments
    const appointmentCount = await Appointment.countDocuments();
    if (appointmentCount === 0 && mockAppointments.length) {
      const appointments = mockAppointments.map(appt => {
        const doctor = doctorLookup[appt.doctorName];
        const user = userLookup[appt.patientEmail];
        return {
          ...appt,
          doctorId: doctor?._id?.toString() || appt.doctorId,
          patientName: user?.name || appt.patientName,
        };
      });
      await Appointment.insertMany(appointments);
      console.log(`✅ Seeded Appointments (${appointments.length})`);
    } else {
      console.log(`ℹ️ Appointments already have ${appointmentCount} records, skipping`);
    }

    // Prescriptions
    const prescriptionCount = await Prescription.countDocuments();
    if (prescriptionCount === 0 && mockPrescriptions.length) {
      const prescriptions = mockPrescriptions.map(prescription => {
        const user = userLookup[prescription.userEmail];
        return {
          ...prescription,
          userId: user?._id?.toString() || prescription.userId,
          userName: user?.name || prescription.userName,
        };
      });
      await Prescription.insertMany(prescriptions);
      console.log(`✅ Seeded Prescriptions (${prescriptions.length})`);
    } else {
      console.log(`ℹ️ Prescriptions already have ${prescriptionCount} records, skipping`);
    }

    // Payments
    const paymentCount = await Payment.countDocuments();
    if (paymentCount === 0 && mockPayments.length) {
      const payments = mockPayments.map(payment => {
        const user = userLookup[payment.userEmail];
        return {
          ...payment,
          user: user?.name || payment.user,
        };
      });
      await Payment.insertMany(payments);
      console.log(`✅ Seeded Payments (${payments.length})`);
    } else {
      console.log(`ℹ️ Payments already have ${paymentCount} records, skipping`);
    }

    // Activities
    await seedIfEmpty(UserActivity, mockUserActivities, 'User Activities');

    // Carts
    const cartCount = await Cart.countDocuments();
    if (cartCount === 0 && mockCarts.length) {
      const carts = mockCarts
        .map(cart => {
          const user = userLookup[cart.userEmail];
          if (!user) return null;
          return {
            userId: user._id.toString(),
            items: cart.items,
          };
        })
        .filter(Boolean);
      if (carts.length) {
        await Cart.insertMany(carts);
        console.log(`✅ Seeded Carts (${carts.length})`);
      }
    } else {
      console.log(`ℹ️ Carts already have ${cartCount} records, skipping`);
    }

    // Settings (upsert so values always there)
    await Settings.findOneAndUpdate(
      { key: 'deliveryChargeDhaka' },
      { value: mockSettings.deliveryChargeDhaka },
      { upsert: true, new: true }
    );
    await Settings.findOneAndUpdate(
      { key: 'deliveryChargeOutside' },
      { value: mockSettings.deliveryChargeOutside },
      { upsert: true, new: true }
    );
    await Settings.findOneAndUpdate(
      { key: 'socialMediaLinks' },
      { value: mockSettings.socialMediaLinks },
      { upsert: true, new: true }
    );
    console.log('✅ Settings saved');

    console.log('🎉 MongoDB seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

run();

