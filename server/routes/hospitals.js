import express from 'express';
import { Hospital } from '../models/Hospital.js';
import { deleteImage } from '../utils/cloudinary.js';

const router = express.Router();

// Get all hospitals
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get hospital by ID
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create hospital
router.post('/', async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    await hospital.save();
    res.status(201).json(hospital);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update hospital
router.put('/:id', async (req, res) => {
  try {
    // Get existing hospital to check for image change
    const existingHospital = await Hospital.findById(req.params.id);
    if (!existingHospital) return res.status(404).json({ error: 'Hospital not found' });

    // If image is being replaced, delete old one from Cloudinary
    if (req.body.image && existingHospital.image &&
      req.body.image !== existingHospital.image &&
      existingHospital.image.includes('cloudinary.com')) {
      await deleteImage(existingHospital.image);
    }

    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(hospital);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete hospital
router.delete('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    // Delete image from Cloudinary
    if (hospital.image && hospital.image.includes('cloudinary.com')) {
      await deleteImage(hospital.image);
    }

    res.json({ message: 'Hospital deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
