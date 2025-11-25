import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  image: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  uploadDate: { type: String, required: true },
  notes: { type: String }
}, {
  timestamps: true
});

export const Prescription = mongoose.model('Prescription', prescriptionSchema);

