import { Part } from 'firebase/ai';

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

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64Data,
      mimeType: resolvedMimeType,
    },
  };
}
