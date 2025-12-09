import express from 'express';
import { Doctor } from '../models/Doctor.js';
import { deleteImage } from '../utils/cloudinary.js';

const router = express.Router();

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create doctor
router.post('/', async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update doctor
router.put('/:id', async (req, res) => {
  try {
    // Get existing doctor to check for image change
    const existingDoctor = await Doctor.findById(req.params.id);
    if (!existingDoctor) return res.status(404).json({ error: 'Doctor not found' });

    // If image is being replaced, delete old one from Cloudinary
    if (req.body.image && existingDoctor.image &&
      req.body.image !== existingDoctor.image &&
      existingDoctor.image.includes('cloudinary.com')) {
      await deleteImage(existingDoctor.image);
    }

    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete doctor
router.delete('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    // Delete image from Cloudinary
    if (doctor.image && doctor.image.includes('cloudinary.com')) {
      await deleteImage(doctor.image);
    }

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
