const CLOUDINARY_CLOUD_NAME = 'dchrmef0d';
const CLOUDINARY_UPLOAD_PRESET = 'jeevita';

interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
}

/**
 * Upload image to Cloudinary using unsigned upload preset
 * @param imageData - Base64 image data URL
 * @param folder - Folder for organizing images (e.g., 'doctors', 'medicines')
 * @returns Cloudinary secure URL
 */
export const uploadToCloudinary = async (
    imageData: string,
    folder: string
): Promise<string> => {
    // Skip if already a Cloudinary URL
    if (imageData.includes('cloudinary.com')) {
        return imageData;
    }

    // Skip if not a base64 data URL
    if (!imageData.startsWith('data:')) {
        return imageData;
    }

    try {
        const formData = new FormData();

        // Convert base64 to blob
        const response = await fetch(imageData);
        const blob = await response.blob();

        formData.append('file', blob);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', `jeevita/${folder}`);

        const uploadResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            console.error('Cloudinary upload error:', errorData);
            throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
        }

        const data: CloudinaryResponse = await uploadResponse.json();
        console.log('Image uploaded to Cloudinary:', data.secure_url);
        return data.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

/**
 * Check if a string is a base64 image
 */
export const isBase64Image = (str: string): boolean => {
    return Boolean(str && typeof str === 'string' && str.startsWith('data:image'));
};

/**
 * Upload multiple images to Cloudinary
 */
export const uploadMultipleToCloudinary = async (
    images: string[],
    folder: string
): Promise<string[]> => {
    const uploadPromises = images.map(img => uploadToCloudinary(img, folder));
    return Promise.all(uploadPromises);
};
