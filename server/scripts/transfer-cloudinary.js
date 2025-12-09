import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import https from 'https';
import { Doctor } from '../models/Doctor.js';
import { Medicine } from '../models/Medicine.js';
import { Hospital } from '../models/Hospital.js';
import { CarouselSlide } from '../models/CarouselSlide.js';
import { Prescription } from '../models/Prescription.js';
import { User } from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI ||
    'mongodb+srv://db_userjeevita:625691878jeevita@cluster0.74dzmyt.mongodb.net/jeevita?retryWrites=true&w=majority&appName=Cluster0';

// OLD account credentials - source
const OLD_CLOUD = {
    cloud_name: 'deal7ji7s',
    api_key: '177576344198984',
    api_secret: '6BzBkT0LwWREmcnypPkAhHsK8_0'
};

// NEW account credentials - destination (from env)
const NEW_CLOUD = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
};

/**
 * Get base64 from old Cloudinary using API
 */
async function getImageBase64FromOldCloud(publicId) {
    return new Promise((resolve, reject) => {
        // Configure for old account temporarily
        cloudinary.config(OLD_CLOUD);

        // Get the direct URL with no transforms
        const url = cloudinary.url(publicId, { secure: true, format: 'jpg' });
        console.log('    Fetching from:', url);

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }

            const chunks = [];
            response.on('data', chunk => chunks.push(chunk));
            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
                resolve(base64);
            });
            response.on('error', reject);
        }).on('error', reject);
    });
}

/**
 * Upload base64 to new Cloudinary
 */
async function uploadToNewCloud(base64Data, folder) {
    cloudinary.config(NEW_CLOUD);

    const result = await cloudinary.uploader.upload(base64Data, {
        folder: `jeevita/${folder}`,
        resource_type: 'auto'
    });

    return result.secure_url;
}

/**
 * Extract public_id from Cloudinary URL
 */
function extractPublicId(url) {
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v.../folder/file.ext
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i);
    return match ? match[1] : null;
}

/**
 * Transfer images for a collection
 */
async function transferCollection(Model, modelName, imageField = 'image') {
    console.log(`\n📦 Transferring ${modelName}...`);

    const documents = await Model.find({});
    let transferred = 0;
    let skipped = 0;
    let failed = 0;

    for (const doc of documents) {
        const imageUrl = doc[imageField];

        if (!imageUrl) {
            skipped++;
            continue;
        }

        // Skip if already on new account
        if (imageUrl.includes('dchrmef0d')) {
            console.log(`  ⏭️  Already on new account: ${doc._id}`);
            skipped++;
            continue;
        }

        // Transfer if from old account
        if (imageUrl.includes('deal7ji7s')) {
            try {
                console.log(`  🔄 Transferring: ${doc._id}`);

                // Extract public_id from URL
                const publicId = extractPublicId(imageUrl);
                if (!publicId) {
                    throw new Error('Could not extract public_id from URL');
                }

                // Get image from old account
                const base64 = await getImageBase64FromOldCloud(publicId);
                console.log(`    Got base64 (${Math.round(base64.length / 1024)}KB)`);

                // Upload to new account
                const newUrl = await uploadToNewCloud(base64, modelName.toLowerCase());
                console.log(`    Uploaded to: ${newUrl.substring(0, 60)}...`);

                // Update document
                doc[imageField] = newUrl;
                await doc.save();
                transferred++;
                console.log(`  ✅ Transferred: ${doc._id}`);

            } catch (error) {
                failed++;
                console.error(`  ❌ Failed: ${doc._id}:`, error.message);
            }

            await new Promise(r => setTimeout(r, 500));
            continue;
        }

        // Skip external URLs
        console.log(`  ⏭️  External URL: ${doc._id}`);
        skipped++;
    }

    console.log(`  📊 ${modelName}: ${transferred} transferred, ${skipped} skipped, ${failed} failed`);
    return { transferred, skipped, failed };
}

async function run() {
    console.log('🚀 Transferring Images Between Cloudinary Accounts');
    console.log('From:', OLD_CLOUD.cloud_name, '→ To:', NEW_CLOUD.cloud_name);
    console.log('================================\n');

    if (!NEW_CLOUD.api_key || !NEW_CLOUD.api_secret) {
        console.error('❌ Error: New Cloudinary credentials not set');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const results = {
            doctors: await transferCollection(Doctor, 'Doctors', 'image'),
            medicines: await transferCollection(Medicine, 'Medicines', 'image'),
            hospitals: await transferCollection(Hospital, 'Hospitals', 'image'),
            carousel: await transferCollection(CarouselSlide, 'Carousel', 'image'),
            prescriptions: await transferCollection(Prescription, 'Prescriptions', 'image'),
            users: await transferCollection(User, 'Users', 'profileImage'),
        };

        console.log('\n================================');
        console.log('📈 Transfer Summary');
        console.log('================================');

        let totalTransferred = 0;
        let totalSkipped = 0;
        let totalFailed = 0;

        for (const [collection, result] of Object.entries(results)) {
            console.log(`${collection}: ${result.transferred} transferred, ${result.skipped} skipped, ${result.failed} failed`);
            totalTransferred += result.transferred;
            totalSkipped += result.skipped;
            totalFailed += result.failed;
        }

        console.log('--------------------------------');
        console.log(`Total: ${totalTransferred} transferred, ${totalSkipped} skipped, ${totalFailed} failed`);
        console.log('\n🎉 Transfer completed!');

    } catch (error) {
        console.error('\n❌ Transfer failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

run();
