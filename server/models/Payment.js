import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: { type: String, required: true },
  userEmail: { type: String, required: true },
  type: { type: String, enum: ['appointment', 'medicine'], required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  date: { type: String, required: true },
  timestamp: { type: String, required: true },
  orderId: { type: String },
  paymentMethod: { type: String, enum: ['cod', 'bkash'] },
  address: { type: mongoose.Schema.Types.Mixed },
  items: [mongoose.Schema.Types.Mixed],
  deliveryFee: { type: Number },
  orderStatus: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'rejected'] }
}, {
  timestamps: true
});

export const Payment = mongoose.model('Payment', paymentSchema);

