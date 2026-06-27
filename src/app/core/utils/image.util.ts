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
