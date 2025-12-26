/**
 * Checks if a file is larger than 3MB.
 * If so, compresses it using HTML Canvas to reduce size (resize + jpeg quality).
 */
export async function compressImage(file: File): Promise<File> {
    const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
    
    // 1. If file is small enough or not an image, return original
    if (file.size <= MAX_SIZE_BYTES || !file.type.startsWith('image/')) {
        return file;
    }

    console.log(`[Compression] Original: ${(file.size / 1024 / 1024).toFixed(2)}MB. Compressing...`);

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            
            // 2. Calculate new dimensions (Max 2560px width/height to ensure < 3MB)
            let width = img.width;
            let height = img.height;
            const MAX_DIMENSION = 2560;

            if (width > height) {
                if (width > MAX_DIMENSION) {
                    height = Math.round((height * MAX_DIMENSION) / width);
                    width = MAX_DIMENSION;
                }
            } else {
                if (height > MAX_DIMENSION) {
                    width = Math.round((width * MAX_DIMENSION) / height);
                    height = MAX_DIMENSION;
                }
            }

            // 3. Draw to Canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                console.warn("[Compression] Canvas context failed, using original.");
                resolve(file);
                return;
            }

            // Draw image with smoothing
            ctx.drawImage(img, 0, 0, width, height);

            // 4. Export as JPEG with 0.8 quality
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        console.warn("[Compression] Blob creation failed, using original.");
                        resolve(file);
                        return;
                    }

                    console.log(`[Compression] New size: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);

                    // Create new File object
                    const newFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });

                    resolve(newFile);
                },
                'image/jpeg',
                0.8 // 80% quality
            );
        };

        img.onerror = (err) => {
            console.warn("[Compression] Image load failed, using original.", err);
            resolve(file); // Fallback to original on error
        };

        img.src = url;
    });
}