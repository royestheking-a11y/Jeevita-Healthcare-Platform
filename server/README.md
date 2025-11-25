# Jeevita Backend Server

This is the backend server for the Jeevita Healthcare Platform, built with Express.js and MongoDB.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Server will run on**: `http://localhost:5000`

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/email/:email` - Get user by email
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/login` - Login user

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Medicines
- `GET /api/medicines` - Get all medicines
- `GET /api/medicines/:id` - Get medicine by ID
- `POST /api/medicines` - Create medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:id` - Get hospital by ID
- `POST /api/hospitals` - Create hospital
- `PUT /api/hospitals/:id` - Update hospital
- `DELETE /api/hospitals/:id` - Delete hospital

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Prescriptions
- `GET /api/prescriptions` - Get all prescriptions
- `GET /api/prescriptions/:id` - Get prescription by ID
- `GET /api/prescriptions/user/:userId` - Get prescriptions by user ID
- `POST /api/prescriptions` - Create prescription
- `PUT /api/prescriptions/:id` - Update prescription
- `DELETE /api/prescriptions/:id` - Delete prescription

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Carousel
- `GET /api/carousel` - Get all carousel slides
- `GET /api/carousel/:id` - Get slide by ID
- `POST /api/carousel` - Create slide
- `PUT /api/carousel/:id` - Update slide
- `DELETE /api/carousel/:id` - Delete slide

### Activities
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create activity
- `DELETE /api/activities/:id` - Delete activity

### Messages
- `GET /api/messages` - Get all messages
- `GET /api/messages/:id` - Get message by ID
- `POST /api/messages` - Create message
- `PUT /api/messages/:id` - Update message
- `POST /api/messages/:id/reply` - Add reply to message
- `DELETE /api/messages/:id` - Delete message

### Refunds
- `GET /api/refunds` - Get all refund requests
- `GET /api/refunds/:id` - Get refund by ID
- `POST /api/refunds` - Create refund request
- `PUT /api/refunds/:id` - Update refund request
- `DELETE /api/refunds/:id` - Delete refund request

### Carts
- `GET /api/carts/:userId` - Get cart by user ID
- `PUT /api/carts/:userId` - Update cart
- `DELETE /api/carts/:userId` - Clear cart

### Settings
- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get setting by key
- `POST /api/settings/:key` - Set setting

## MongoDB Database

- **Database Name**: `jeevita`
- **Collections**: 
  - users
  - doctors
  - medicines
  - hospitals
  - appointments
  - prescriptions
  - payments
  - carouselslides
  - useractivities
  - messages
  - refundrequests
  - carts
  - settings

## Environment Variables

The MongoDB connection string is configured in `config/database.js`. For production, consider using environment variables.

