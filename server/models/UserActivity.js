import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true },
  action: { type: String, required: true },
  timestamp: { type: String, required: true },
  type: { type: String, enum: ['appointment', 'order', 'cancellation'], required: true }
}, {
  timestamps: true
});

export const UserActivity = mongoose.model('UserActivity', userActivitySchema);

