import express from 'express';
import { Prescription } from '../models/Prescription.js';
import { deleteImage } from '../utils/cloudinary.js';
import { createWorker } from 'tesseract.js';
import { Medicine } from '../models/Medicine.js';

const router = express.Router();

// Helper to escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Parse OCR text to extract potential medicine names
function extractMedicineNames(text) {
  // Split by newlines and common separators
  const lines = text.split(/[\n\r]+/).map(line => line.trim()).filter(line => line.length > 2);

  const potentialMedicines = [];

  for (const line of lines) {
    // Skip lines that look like headers or instructions
    if (line.match(/^(dr\.|doctor|patient|date|signature|rx|prescription)/i)) continue;
    if (line.match(/^[\d\s\-\/\.]+$/)) continue; // Skip date-like or number-only lines

    // Look for medicine-like patterns (words with optional dosage)
    // Common format: "Medicine Name 500mg" or "Paracetamol Tab"
    const medicineMatch = line.match(/^([A-Za-z][A-Za-z\s\-]+)/);
    if (medicineMatch) {
      const name = medicineMatch[1].trim();
      if (name.length >= 3 && name.length <= 50) {
        // Extract dosage if present
        const dosageMatch = line.match(/(\d+\s*(?:mg|ml|mcg|g|iu|%|tab|cap|tablet|capsule)s?)/i);
        const quantityMatch = line.match(/x\s*(\d+)|(\d+)\s*(?:times|pcs|pieces|nos)/i);
        const formMatch = line.match(/(tablet|capsule|syrup|injection|cream|ointment|gel|drops|inhaler|powder)/i);

        potentialMedicines.push({
          name: name.replace(/\s+/g, ' ').trim(),
          dosage: dosageMatch ? dosageMatch[1] : null,
          quantity: quantityMatch ? (quantityMatch[1] || quantityMatch[2]) : null,
          form: formMatch ? formMatch[1] : null
        });
      }
    }
  }

  // Remove duplicates by name
  const seen = new Set();
  return potentialMedicines.filter(med => {
    const key = med.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Analyze prescription using OCR.space API (500 free requests/day)
router.post('/analyze', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const OCR_API_KEY = process.env.OCR_SPACE_API_KEY;
    if (!OCR_API_KEY) {
      console.error('OCR_SPACE_API_KEY is not set');
      return res.status(500).json({ error: 'OCR service not configured. Please set OCR_SPACE_API_KEY.' });
    }

    console.log('Calling OCR.space API for:', imageUrl);

    // Call OCR.space API
    const formData = new FormData();
    formData.append('url', imageUrl);
    formData.append('apikey', OCR_API_KEY);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // Engine 2 is better for handwriting

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData
    });

    const ocrResult = await ocrResponse.json();

    if (ocrResult.IsErroredOnProcessing) {
      console.error('OCR.space error:', ocrResult.ErrorMessage);
      return res.status(500).json({ error: 'OCR failed: ' + (ocrResult.ErrorMessage || 'Unknown error') });
    }

    const ocrText = ocrResult.ParsedResults?.[0]?.ParsedText || '';
    console.log('OCR extracted text:', ocrText.substring(0, 300));

    if (!ocrText.trim()) {
      return res.json({
        success: true,
        verifiedMedicines: [],
        unverifiedItems: [],
        message: 'Could not read text from image. Please try a clearer image or submit for manual review.'
      });
    }

    // Extract potential medicine names from OCR text
    const extractedMedicines = extractMedicineNames(ocrText);
    console.log('Potential medicines found:', extractedMedicines.map(m => m.name));

    // Verify against database
    const verificationResults = await Promise.all(extractedMedicines.map(async (item) => {
      const escapedName = escapeRegExp(item.name);
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

    console.log(`Analysis complete: ${verifiedMedicines.length} verified, ${unverifiedItems.length} unverified`);

    res.json({
      success: true,
      verifiedMedicines,
      unverifiedItems,
      rawText: ocrText
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze prescription: ' + error.message });
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
