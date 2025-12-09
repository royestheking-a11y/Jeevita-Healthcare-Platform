import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
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

// Configure Cloudinary with CORRECT credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image URL to Cloudinary (can upload from another URL)
 */
async function uploadFromUrl(imageUrl, folder) {
    try {
        const result = await cloudinary.uploader.upload(imageUrl, {
            folder: `jeevita/${folder}`,
            resource_type: 'auto'
        });
        return result.secure_url;
    } catch (error) {
        console.error('Upload error:', error.message);
        throw error;
    }
}

/**
 * Re-migrate a collection - handles URLs from wrong Cloudinary account
 */
async function remigrateCollection(Model, modelName, imageField = 'image') {
    console.log(`\n📦 Re-migrating ${modelName}...`);

    const documents = await Model.find({});
    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    for (const doc of documents) {
        const imageData = doc[imageField];

        // Skip if no image
        if (!imageData) {
            skipped++;
            continue;
        }

        // Skip if already on correct Cloudinary account
        if (imageData.includes('dchrmef0d')) {
            console.log(`  ⏭️  Already on correct account: ${doc._id}`);
            skipped++;
            continue;
        }

        // Re-migrate if from wrong Cloudinary account (deal7ji7s)
        if (imageData.includes('deal7ji7s') || imageData.includes('cloudinary.com')) {
            try {
                console.log(`  🔄 Re-uploading from wrong account: ${doc._id}`);
                const newUrl = await uploadFromUrl(imageData, modelName.toLowerCase());
                doc[imageField] = newUrl;
                await doc.save();
                migrated++;
                console.log(`  ✅ Re-migrated: ${doc._id} -> ${newUrl.substring(0, 60)}...`);
            } catch (error) {
                failed++;
                console.error(`  ❌ Failed: ${doc._id}:`, error.message);
            }
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
        }

        // Upload base64 images
        if (imageData.startsWith('data:')) {
            try {
                console.log(`  📤 Uploading base64: ${doc._id}`);
                const newUrl = await uploadFromUrl(imageData, modelName.toLowerCase());
                doc[imageField] = newUrl;
                await doc.save();
                migrated++;
                console.log(`  ✅ Migrated: ${doc._id} -> ${newUrl.substring(0, 60)}...`);
            } catch (error) {
                failed++;
                console.error(`  ❌ Failed: ${doc._id}:`, error.message);
            }
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
        }

        // Skip external URLs (Unsplash, etc.)
        console.log(`  ⏭️  External URL, skipping: ${doc._id}`);
        skipped++;
    }

    console.log(`  📊 ${modelName}: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
    return { migrated, skipped, failed };
}

async function run() {
    console.log('🚀 Starting Re-Migration to Correct Cloudinary Account');
    console.log('Target cloud:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('================================\n');

    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('❌ Error: CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be set');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const results = {
            doctors: await remigrateCollection(Doctor, 'Doctors', 'image'),
            medicines: await remigrateCollection(Medicine, 'Medicines', 'image'),
            hospitals: await remigrateCollection(Hospital, 'Hospitals', 'image'),
            carousel: await remigrateCollection(CarouselSlide, 'Carousel', 'image'),
            prescriptions: await remigrateCollection(Prescription, 'Prescriptions', 'image'),
            users: await remigrateCollection(User, 'Users', 'profileImage'),
        };

        // Summary
        console.log('\n================================');
        console.log('📈 Re-Migration Summary');
        console.log('================================');

        let totalMigrated = 0;
        let totalSkipped = 0;
        let totalFailed = 0;

        for (const [collection, result] of Object.entries(results)) {
            console.log(`${collection}: ${result.migrated} migrated, ${result.skipped} skipped, ${result.failed} failed`);
            totalMigrated += result.migrated;
            totalSkipped += result.skipped;
            totalFailed += result.failed;
        }

        console.log('--------------------------------');
        console.log(`Total: ${totalMigrated} migrated, ${totalSkipped} skipped, ${totalFailed} failed`);
        console.log('\n🎉 Re-migration completed!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

run();
