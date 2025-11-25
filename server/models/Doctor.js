import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  degrees: { type: String, required: true },
  experience: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  image: { type: String, required: true },
  location: { type: String, required: true },
  fee: { type: Number, required: true },
  availability: [String],
  timeSlots: [String]
}, {
  timestamps: true
});

export const Doctor = mongoose.model('Doctor', doctorSchema);

