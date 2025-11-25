import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  specialty: { type: String, required: true },
  image: { type: String, required: true },
  phone: { type: String },
  hours: { type: String },
  description: { type: String },
  departments: [String],
  facilities: [String],
  beds: { type: String },
  staff: { type: String },
  email: { type: String },
  rating: { type: Number }
}, {
  timestamps: true
});

export const Hospital = mongoose.model('Hospital', hospitalSchema);

