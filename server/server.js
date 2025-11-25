import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';

// Import routes
import usersRoutes from './routes/users.js';
import doctorsRoutes from './routes/doctors.js';
import medicinesRoutes from './routes/medicines.js';
import hospitalsRoutes from './routes/hospitals.js';
import appointmentsRoutes from './routes/appointments.js';
import prescriptionsRoutes from './routes/prescriptions.js';
import paymentsRoutes from './routes/payments.js';
import carouselRoutes from './routes/carousel.js';
import activitiesRoutes from './routes/activities.js';
import messagesRoutes from './routes/messages.js';
import refundsRoutes from './routes/refunds.js';
import cartsRoutes from './routes/carts.js';
import settingsRoutes from './routes/settings.js';

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      const isLocalhost =
        origin &&
        (origin.startsWith('http://localhost:') ||
          origin.startsWith('http://127.0.0.1:'));

      const isVercel = origin && origin.includes('.vercel.app');

      if (!origin || isLocalhost || isVercel || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(null, true); // Allow anyway for now to debug
      }
    },
    credentials: true,
  })
);
app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/users', usersRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/hospitals', hospitalsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/prescriptions', prescriptionsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/carousel', carouselRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/refunds', refundsRoutes);
app.use('/api/carts', cartsRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Jeevita API is running' });
});

// Export app for Vercel
export default app;

// Only listen if run directly
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

