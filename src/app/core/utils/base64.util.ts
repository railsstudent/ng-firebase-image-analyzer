import { Part } from 'firebase/ai';

/**
 * Reads a File or Blob as a Data URL (base64 encoded string with MIME type prefix).
 *
 * @param file The File or Blob to read.
 * @returns A promise that resolves to the Data URL string.
 */
export function readFileAsDataURL(file: File | Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a File or Blob to a base64 inline data Part object for the Firebase AI SDK.
 *
 * @param file The File or Blob to convert.
 * @param mimeType Optional MIME type override. Defaults to file.type.
 * @returns A promise that resolves to the Part object containing the base64 inline data.
 */
export async function fileToGenerativePart(file: File | Blob, mimeType?: string): Promise<Part> {
  const resolvedMimeType = mimeType || file.type;
  if (!resolvedMimeType) {
    throw new Error('MIME type must be specified or present on the File/Blob.');
  }

  const dataUrl = await readFileAsDataURL(file);
  const base64Data = dataUrl.split(',')[1];

  return {
    inlineData: {
      data: base64Data,
      mimeType: resolvedMimeType,
    },
  };
}
