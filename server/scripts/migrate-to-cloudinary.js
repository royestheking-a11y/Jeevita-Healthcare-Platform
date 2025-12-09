import mongoose from 'mongoose';
import { uploadImage } from '../utils/cloudinary.js';
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

/**
 * Migrate a single collection's images to Cloudinary
 */
async function migrateCollection(Model, modelName, imageField = 'image') {
    console.log(`\n📦 Migrating ${modelName}...`);

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

        // Skip if already a Cloudinary URL
        if (imageData.includes('cloudinary.com')) {
            console.log(`  ⏭️  Already migrated: ${doc._id}`);
            skipped++;
            continue;
        }

        // Skip if not base64
        if (!imageData.startsWith('data:')) {
            console.log(`  ⏭️  Not a base64 image: ${doc._id}`);
            skipped++;
            continue;
        }

        try {
            console.log(`  📤 Uploading ${modelName} ${doc._id}...`);
            const cloudinaryUrl = await uploadImage(imageData, modelName.toLowerCase());
            doc[imageField] = cloudinaryUrl;
            await doc.save();
            migrated++;
            console.log(`  ✅ Migrated: ${doc._id} -> ${cloudinaryUrl.substring(0, 60)}...`);
        } catch (error) {
            failed++;
            console.error(`  ❌ Failed to migrate ${doc._id}:`, error.message);
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`  📊 ${modelName}: ${migrated} migrated, ${skipped} skipped, ${failed} failed`);
    return { migrated, skipped, failed };
}

/**
 * Main migration function
 */
async function runMigration() {
    console.log('🚀 Starting Cloudinary Migration');
    console.log('================================\n');

    // Check for required environment variables
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error('❌ Error: CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be set');
        console.log('\nPlease add these to your .env file:');
        console.log('CLOUDINARY_CLOUD_NAME=deal7ji7s');
        console.log('CLOUDINARY_API_KEY=177576344198984');
        console.log('CLOUDINARY_API_SECRET=6BzBkT0LwWREmcnypPkAhHsK8_0');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const results = {
            doctors: await migrateCollection(Doctor, 'Doctors', 'image'),
            medicines: await migrateCollection(Medicine, 'Medicines', 'image'),
            hospitals: await migrateCollection(Hospital, 'Hospitals', 'image'),
            carousel: await migrateCollection(CarouselSlide, 'Carousel', 'image'),
            prescriptions: await migrateCollection(Prescription, 'Prescriptions', 'image'),
            users: await migrateCollection(User, 'Users', 'profileImage'),
        };

        // Summary
        console.log('\n================================');
        console.log('📈 Migration Summary');
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
        console.log('\n🎉 Migration completed!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

// Run the migration
runMigration();
