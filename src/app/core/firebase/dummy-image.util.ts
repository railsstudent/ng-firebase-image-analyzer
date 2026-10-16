import type { Part } from 'firebase/ai';
import { FALLBACK_IMAGE_SIZE } from './image.const';

const DEFAULT_IMAGE_QUALITY = 0.1;

/**
 * Creates a minimal black JPEG inlineData Part object using a DOM canvas.
 * Used to warm up GPU pipelines and trigger shader pre-compilation.
 */
export function createDummyImagePart(doc: Document, size: number = FALLBACK_IMAGE_SIZE): Part {
  const canvas = doc.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);
  }

  const dummyBase64 = canvas.toDataURL('image/jpeg', DEFAULT_IMAGE_QUALITY).split(',')[1];

  return {
    type: 'inlineData',
    inlineData: {
      data: dummyBase64,
      mimeType: 'image/jpeg',
    },
  };
}
