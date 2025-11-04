import imageCompression from 'browser-image-compression';

// Compress image before upload
export const compressImage = async (file: File, quality: number = 0.8): Promise<File> => {
  const options = {
    maxSizeMB: 1, // Max 1MB
    maxWidthOrHeight: 1920, // Max dimension
    useWebWorker: true,
    fileType: 'image/jpeg', // Convert all to JPEG
    initialQuality: quality,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Return original if compression fails
  }
};

// Add watermark to image
export const addWatermark = async (
  file: File,
  watermarkText: string,
  logoUrl?: string
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Add semi-transparent overlay at bottom
        const overlayHeight = 60;
        const gradient = ctx.createLinearGradient(0, canvas.height - overlayHeight, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);

        // Add watermark text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(watermarkText, canvas.width - 20, canvas.height - 20);

        // Add small "لا تشتتني" logo text
        ctx.font = '16px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('لا تشتتني', canvas.width - 20, canvas.height - 45);

        // Convert canvas to blob then to file
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const watermarkedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(watermarkedFile);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          0.95 // Quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

// Process image: compress + watermark
export const processImage = async (
  file: File,
  storeName: string,
  options?: {
    enableCompression?: boolean;
    enableWatermark?: boolean;
    compressionQuality?: number;
  }
): Promise<File> => {
  try {
    const {
      enableCompression = true,
      enableWatermark = true,
      compressionQuality = 0.8,
    } = options || {};

    let processedFile = file;
    
    // First compress if enabled
    if (enableCompression) {
      processedFile = await compressImage(processedFile, compressionQuality);
    }
    
    // Then add watermark if enabled
    if (enableWatermark) {
      processedFile = await addWatermark(processedFile, storeName);
    }
    
    return processedFile;
  } catch (error) {
    console.error('Error processing image:', error);
    return file; // Return original if processing fails
  }
};
