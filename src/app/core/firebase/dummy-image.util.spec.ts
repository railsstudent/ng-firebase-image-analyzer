import { describe, expect, it, vi } from 'vitest';
import { FALLBACK_IMAGE_SIZE } from './image.const';
import { createDummyImagePart } from './dummy-image.util';

describe('createDummyImagePart', () => {
  function createMockDocument(toDataUrlResult = 'data:image/jpeg;base64,mockBase64String'): {
    mockDoc: Document;
    mockCanvas: HTMLCanvasElement;
    mockContext: CanvasRenderingContext2D;
  } {
    const mockContext = {
      fillStyle: '',
      fillRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockContext),
      toDataURL: vi.fn().mockReturnValue(toDataUrlResult),
    } as unknown as HTMLCanvasElement;

    const mockDoc = {
      createElement: vi.fn().mockReturnValue(mockCanvas),
    } as unknown as Document;

    return { mockDoc, mockCanvas, mockContext };
  }

  it('creates a canvas with specified size, fills black, and returns inlineData Part', () => {
    const { mockDoc, mockCanvas, mockContext } = createMockDocument();

    const part = createDummyImagePart(mockDoc, 256);

    expect(mockDoc.createElement).toHaveBeenCalledWith('canvas');
    expect(mockCanvas.width).toBe(256);
    expect(mockCanvas.height).toBe(256);
    expect(mockContext.fillStyle).toBe('#000000');
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 256, 256);
    expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.1);
    expect(part).toEqual({
      type: 'inlineData',
      inlineData: {
        data: 'mockBase64String',
        mimeType: 'image/jpeg',
      },
    });
  });

  it('uses FALLBACK_IMAGE_SIZE when size is omitted', () => {
    const { mockDoc, mockCanvas, mockContext } = createMockDocument();

    const part = createDummyImagePart(mockDoc);

    expect(mockCanvas.width).toBe(FALLBACK_IMAGE_SIZE);
    expect(mockCanvas.height).toBe(FALLBACK_IMAGE_SIZE);
    expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, FALLBACK_IMAGE_SIZE, FALLBACK_IMAGE_SIZE);
    expect(part.type).toBe('inlineData');
  });

  it('handles null 2D context gracefully without throwing', () => {
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(null),
      toDataURL: vi.fn().mockReturnValue('data:image/jpeg;base64,emptyContextBase64'),
    } as unknown as HTMLCanvasElement;

    const mockDoc = {
      createElement: vi.fn().mockReturnValue(mockCanvas),
    } as unknown as Document;

    const part = createDummyImagePart(mockDoc, 128);

    expect(part).toEqual({
      type: 'inlineData',
      inlineData: {
        data: 'emptyContextBase64',
        mimeType: 'image/jpeg',
      },
    });
  });
});
