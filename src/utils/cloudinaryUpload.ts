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
 * Upload image or video to Cloudinary using unsigned upload preset
 * @param fileData - Base64 data URL or File object
 * @param folder - Folder for organizing files
 * @param resourceType - 'image' or 'video' (default: 'image')
 * @returns Cloudinary secure URL
 */
export const uploadToCloudinary = async (
    fileData: string | File,
    folder: string,
    resourceType: 'image' | 'video' = 'image'
): Promise<string> => {
    // Skip if already a Cloudinary URL (only for strings)
    if (typeof fileData === 'string' && fileData.includes('cloudinary.com')) {
        return fileData;
    }

    try {
        const formData = new FormData();

        if (typeof fileData === 'string') {
            // Handle Base64 string
            if (!fileData.startsWith('data:')) {
                return fileData; // Return as is if it's just a URL but not cloudinary (unlikely but safe)
            }
            const response = await fetch(fileData);
            const blob = await response.blob();
            formData.append('file', blob);
        } else {
            // Handle File object (for videos)
            formData.append('file', fileData);
        }

        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', `jeevita/${folder}`);

        const uploadResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            console.error('Cloudinary upload error:', errorData);
            throw new Error(errorData.error?.message || `Failed to upload ${resourceType} to Cloudinary`);
        }

        const data: CloudinaryResponse = await uploadResponse.json();
        console.log(`${resourceType} uploaded to Cloudinary:`, data.secure_url);
        return data.secure_url;
    } catch (error) {
        console.error(`Error uploading ${resourceType} to Cloudinary:`, error);
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
