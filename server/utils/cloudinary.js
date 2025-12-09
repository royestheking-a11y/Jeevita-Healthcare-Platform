import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'deal7ji7s',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

/**
 * Upload image to Cloudinary
 * @param {string} imageData - Base64 image data or URL
 * @param {string} folder - Folder name for organization (e.g., 'doctors', 'medicines')
 * @returns {Promise<string>} - Cloudinary secure URL
 */
export const uploadImage = async (imageData, folder) => {
    try {
        // Skip if already a Cloudinary URL
        if (imageData && imageData.includes('cloudinary.com')) {
            return imageData;
        }

        const result = await cloudinary.uploader.upload(imageData, {
            folder: `jeevita/${folder}`,
            resource_type: 'image',
            transformation: [
                { quality: 'auto:good', fetch_format: 'auto' }
            ]
        });
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

/**
 * Delete image from Cloudinary by URL
 * @param {string} imageUrl - Cloudinary image URL
 */
export const deleteImage = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
        return;
    }

    try {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId);
            console.log(`Deleted Cloudinary image: ${publicId}`);
        }
    } catch (error) {
        console.error('Cloudinary delete error:', error);
    }
};

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null
 */
const extractPublicId = (url) => {
    try {
        // Match pattern: /upload/v123456/folder/filename.ext
        const regex = /\/upload\/(?:v\d+\/)?(.+)\.\w+$/;
        const match = url.match(regex);
        return match ? match[1] : null;
    } catch {
        return null;
    }
};

/**
 * Check if a string is a base64 image
 * @param {string} str - String to check
 * @returns {boolean}
 */
export const isBase64Image = (str) => {
    return str && typeof str === 'string' && str.startsWith('data:image');
};

export default cloudinary;
