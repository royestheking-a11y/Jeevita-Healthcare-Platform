# MongoDB Migration Guide

This project has been migrated from localStorage to MongoDB. All data is now stored in a MongoDB database named `jeevita`.

## Setup Instructions

### 1. Backend Server Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

4. The server will run on `http://localhost:5000`

### 2. Frontend Setup

1. The frontend is already configured to connect to the API at `http://localhost:5000/api`
2. If you need to change the API URL, set the environment variable:
   ```bash
   VITE_API_URL=http://localhost:5000/api
   ```

3. Start the frontend:
   ```bash
   npm run dev
   ```

## MongoDB Connection

The MongoDB connection string is configured in `server/config/database.js`:
- **Database**: `jeevita`
- **Connection**: MongoDB Atlas cluster

## Collections Created

The following collections are automatically created in MongoDB:

1. **users** - User accounts
2. **doctors** - Doctor profiles
3. **medicines** - Medicine catalog
4. **hospitals** - Hospital listings
5. **appointments** - Appointment bookings
6. **prescriptions** - Prescription uploads
7. **payments** - Payment transactions
8. **carouselslides** - Homepage carousel slides
9. **useractivities** - User activity logs
10. **messages** - Contact form messages
11. **refundrequests** - Refund requests
12. **carts** - User shopping carts
13. **settings** - Application settings (delivery charges, social links, etc.)

## API Endpoints

All API endpoints are prefixed with `/api`:

- `/api/users` - User management
- `/api/doctors` - Doctor management
- `/api/medicines` - Medicine management
- `/api/hospitals` - Hospital management
- `/api/appointments` - Appointment management
- `/api/prescriptions` - Prescription management
- `/api/payments` - Payment management
- `/api/carousel` - Carousel slide management
- `/api/activities` - Activity logs
- `/api/messages` - Message management
- `/api/refunds` - Refund request management
- `/api/carts` - Cart management
- `/api/settings` - Settings management

## Changes Made

### Frontend Changes

1. **AuthContext** - Now uses API for login/signup
2. **DataContext** - All CRUD operations use API
3. **CartContext** - Cart operations use API
4. **AdminPanel** - Messages, users, refunds, settings use API
5. **ContactUsPage** - Messages sent via API
6. **CartPage** - Delivery charges loaded from API

### Backend Structure

```
server/
├── config/
│   └── database.js       # MongoDB connection
├── models/               # Mongoose models
│   ├── User.js
│   ├── Doctor.js
│   ├── Medicine.js
│   ├── Hospital.js
│   ├── Appointment.js
│   ├── Prescription.js
│   ├── Payment.js
│   ├── CarouselSlide.js
│   ├── UserActivity.js
│   ├── Message.js
│   ├── RefundRequest.js
│   ├── Cart.js
│   └── Settings.js
├── routes/               # API routes
│   ├── users.js
│   ├── doctors.js
│   ├── medicines.js
│   ├── hospitals.js
│   ├── appointments.js
│   ├── prescriptions.js
│   ├── payments.js
│   ├── carousel.js
│   ├── activities.js
│   ├── messages.js
│   ├── refunds.js
│   ├── carts.js
│   └── settings.js
├── server.js             # Express server
└── package.json
```

## Testing

1. Start the backend server
2. Start the frontend application
3. Test all functionality:
   - User registration and login
   - Doctor/Medicine/Hospital management
   - Appointment booking
   - Prescription upload
   - Payment processing
   - Cart management
   - Admin panel operations

## Notes

- All data is now persistent in MongoDB
- The frontend will automatically sync with the backend
- localStorage is still used for session management (current user)
- OTP data remains in localStorage (temporary data)

