const ONE_MB = 1024 * 1024;
const MAX_BYTES = 20 * ONE_MB;

function formatFileSizeMbs(fileSize: number) {
  return `${(fileSize / ONE_MB).toFixed(2)}MB`;
}

/**
 * Validates whether the given value is a File or Blob.
 */
export function isValidFile(file: unknown): file is File | Blob {
  return file instanceof File || file instanceof Blob;
}

/**
 * Validates that the file is an image and under the 20MB size limit for inline data.
 *
 * @param file The File or Blob to validate.
 * @throws Error if validation fails.
 */
export function validateImageInput(file: File | Blob): void {
  if (!file) {
    throw new Error('Image file must be provided.');
  }

  // Validate MIME type
  if (!file.type || !file.type.startsWith('image/')) {
    throw new Error(`Invalid file type: ${file.type || 'unknown'}. The file must be an image.`);
  }

  // Validate size (Gemini inline data limit is 20MB)
  if (file.size > MAX_BYTES) {
    const strFileSize = formatFileSizeMbs(file.size);
    throw new Error(`File size (${strFileSize} exceeds the ${MAX_BYTES}MB limit for inline analysis.`);
  }
}

/**
 * Validates the custom prompt if provided.
 *
 * @param prompt The prompt to validate.
 * @throws Error if validation fails.
 */
export function validatePrompt(prompt?: string): void {
  if (prompt !== undefined && typeof prompt !== 'string') {
    throw new Error('Prompt must be a string.');
  }
  if (prompt !== undefined && prompt.trim() === '') {
    throw new Error('Prompt cannot be empty or whitespace.');
  }
}
/**
 * Resizes any image File/Blob to an EXACT square dimension (e.g., 512x512)
 * so that WebGPU tensor shapes match 100%, avoiding shader recompilation.
 */
export function resizeToFixedDimensions(file: File | Blob, size = 512): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas 2D context'));
        return;
      }

      // Draw image stretched/fitted to the exact square dimensions
      ctx.drawImage(img, 0, 0, size, size);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create Blob'));
        },
        'image/jpeg',
        0.8,
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}
