import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    targetId: { type: String, required: true }, // Doctor ID or Hospital ID
    targetType: { type: String, enum: ['doctor', 'hospital'], required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    appointmentId: { type: String }, // Required if targetType is 'doctor'
}, {
    timestamps: true
});

export const Review = mongoose.model('Review', reviewSchema);
