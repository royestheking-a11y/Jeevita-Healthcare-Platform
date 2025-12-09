import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  description: { type: String },
  genericName: { type: String, required: true },
  manufacturer: { type: String },
  form: { type: String },
  strength: { type: String }
}, {
  timestamps: true
});

export const Medicine = mongoose.model('Medicine', medicineSchema);

