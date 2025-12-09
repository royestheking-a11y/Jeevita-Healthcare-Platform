import express from 'express';
import { Review } from '../models/Review.js';
import { Appointment } from '../models/Appointment.js';
import { User } from '../models/User.js';

const router = express.Router();

// Create a review
router.post('/', async (req, res) => {
    try {
        const { userId, targetId, targetType, rating, comment } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let appointmentId = null;

        if (targetType === 'doctor') {
            // Check for completed appointment
            const appointment = await Appointment.findOne({
                doctorId: targetId,
                patientEmail: user.email,
                status: 'completed'
            });

            if (!appointment) {
                return res.status(403).json({
                    message: 'You can only review doctors after a completed appointment.'
                });
            }
            appointmentId = appointment._id;
        }

        // Check if review already exists for this target
        const existingReview = await Review.findOne({ userId, targetId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this.' });
        }

        const review = new Review({
            userId,
            userName: user.name,
            targetId,
            targetType,
            rating,
            comment,
            status: 'pending', // Reviews need approval
            appointmentId
        });

        await review.save();
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get approved reviews for a target (Doctor/Hospital)
router.get('/:targetId', async (req, res) => {
    try {
        const reviews = await Review.find({
            targetId: req.params.targetId,
            status: 'approved'
        }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all reviews (Admin only)
router.get('/admin/all', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update review status (Admin only)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete review (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
