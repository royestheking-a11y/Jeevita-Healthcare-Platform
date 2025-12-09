import express from 'express';
import { Prescription } from '../models/Prescription.js';
import { deleteImage } from '../utils/cloudinary.js';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Medicine } from '../models/Medicine.js';

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Analyze prescription image
router.post('/analyze', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({ error: 'AI service configuration missing' });
    }

    // Fetch image as buffer
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze this prescription image. Identify all medicines listed. 
    Return a JSON array where each object has:
    - 'name': The name of the medicine (string)
    - 'dosage': The dosage or strength (string, e.g. "500mg"), or null if not clear
    - 'quantity': The quantity (string or number), or null if not clear
    - 'form': The form (string, e.g. "Tablet", "Capsule"), or null if not clear
    
    Only return valid JSON. Do not include markdown formatting.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: imageResponse.headers.get('content-type') || 'image/jpeg'
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean up response if it contains markdown code blocks
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let aiMedicines = [];
    try {
      aiMedicines = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      return res.status(500).json({ error: 'Failed to parse AI analysis results' });
    }

    // Verify against database
    const verificationResults = await Promise.all(aiMedicines.map(async (item) => {
      // Safe regex search
      const escapedName = escapeRegExp(item.name);
      // Search for medicine names that contain the extracted name (case-insensitive)
      const match = await Medicine.findOne({
        name: { $regex: escapedName, $options: 'i' },
        inStock: true
      });

      return {
        ...item,
        verified: !!match,
        matchId: match ? match._id : null,
        matchName: match ? match.name : null,
        matchPrice: match ? match.price : null,
        matchImage: match ? match.image : null
      };
    }));

    const verifiedMedicines = verificationResults.filter(item => item.verified);
    const unverifiedItems = verificationResults.filter(item => !item.verified);

    res.json({
      success: true,
      verifiedMedicines,
      unverifiedItems
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze prescription' });
  }
});

// Get all prescriptions
router.get('/', async (req, res) => {
  try {
    const prescriptions = await Prescription.find();
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get prescription by ID
router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get prescriptions by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ userId: req.params.userId });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create prescription
router.post('/', async (req, res) => {
  try {
    const prescription = new Prescription(req.body);
    await prescription.save();
    res.status(201).json(prescription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update prescription
router.put('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    res.json(prescription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete prescription
router.delete('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndDelete(req.params.id);
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });

    // Delete image from Cloudinary
    if (prescription.image && prescription.image.includes('cloudinary.com')) {
      await deleteImage(prescription.image);
    }

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
