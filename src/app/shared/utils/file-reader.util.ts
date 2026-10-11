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
