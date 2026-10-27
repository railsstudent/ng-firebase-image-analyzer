import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import type { ImageDownloadOptions } from '@/features/image-analysis/interfaces/image-download-options.interface';
import { ImageDownloadService } from './image-download.service';

describe('ImageDownloadService', () => {
  let service: ImageDownloadService;
  let documentMock: Document;
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ImageDownloadService],
    });

    service = TestBed.inject(ImageDownloadService);
    documentMock = TestBed.inject(DOCUMENT);

    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:http://localhost/mock-download-id');
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created without HttpClient dependency', () => {
    expect(service).toBeTruthy();
  });

  it('should process image in-memory, render cropped canvas, and trigger download', async () => {
    const mockDrawImage = vi.fn();
    const mockCtx = {
      filter: '',
      drawImage: mockDrawImage,
    } as unknown as CanvasRenderingContext2D;

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
      toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
        callback(new Blob(['fake-png-content'], { type: 'image/png' }));
      }),
    } as unknown as HTMLCanvasElement;

    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;

    const originalCreateElement = documentMock.createElement.bind(documentMock);
    vi.spyOn(documentMock, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'img') {
        const img = originalCreateElement('img');
        Object.defineProperty(img, 'naturalWidth', { value: 1000, configurable: true });
        Object.defineProperty(img, 'naturalHeight', { value: 500, configurable: true });
        // Trigger load asynchronously when src is assigned
        let srcValue = '';
        Object.defineProperty(img, 'src', {
          get: () => srcValue,
          set: (val: string) => {
            srcValue = val;
            setTimeout(() => {
              if (img.onload) {
                img.onload(new Event('load'));
              }
            }, 0);
          },
          configurable: true,
        });
        return img;
      }
      if (tagName === 'canvas') {
        return mockCanvas;
      }
      if (tagName === 'a') {
        return mockAnchor;
      }
      return originalCreateElement(tagName);
    });

    const options: ImageDownloadOptions = {
      url: 'data:image/png;base64,validbase64image',
      crop: { xMin: 0.125, yMin: 0.25, xMax: 0.875, yMax: 0.75 },
      filterStyle: 'brightness(1.2) saturate(1.5)',
      filename: 'sample-photo.jpeg',
    };

    await service.downloadFilteredCrop(options);

    // Verify canvas dimensions based on crop and image size:
    // cropWidth = (0.875 - 0.125) * 1000 = 750
    // cropHeight = (0.75 - 0.25) * 500 = 250
    expect(mockCanvas.width).toBe(750);
    expect(mockCanvas.height).toBe(250);

    // Verify CSS filter string applied to context
    expect(mockCtx.filter).toBe('brightness(1.2) saturate(1.5)');

    // Verify drawImage parameters: (img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    expect(mockDrawImage).toHaveBeenCalledWith(
      expect.any(Object),
      125, // 0.125 * 1000
      125, // 0.25 * 500
      750,
      250,
      0,
      0,
      750,
      250,
    );

    // Verify anchor click and sanitized filename with .png extension
    expect(mockAnchor.download).toBe('sample-photo.png');
    expect(mockAnchor.click).toHaveBeenCalled();

    // Verify revocation of the object URL created for download
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost/mock-download-id');
  });

  it('should reject when image element fails to load', async () => {
    const originalCreateElement = documentMock.createElement.bind(documentMock);
    vi.spyOn(documentMock, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'img') {
        const img = originalCreateElement('img');
        Object.defineProperty(img, 'src', {
          set: () => {
            setTimeout(() => {
              if (img.onerror) {
                img.onerror(new Event('error'));
              }
            }, 0);
          },
          configurable: true,
        });
        return img;
      }
      return originalCreateElement(tagName);
    });

    const options: ImageDownloadOptions = {
      url: 'data:image/png;base64,invalid',
      crop: { xMin: 0, yMin: 0, xMax: 1, yMax: 1 },
      filterStyle: 'none',
      filename: 'test.png',
    };

    await expect(service.downloadFilteredCrop(options)).rejects.toThrow('Failed to load image element');
  });

  it('should reject when canvas 2D context is unavailable', async () => {
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(null),
    } as unknown as HTMLCanvasElement;

    const originalCreateElement = documentMock.createElement.bind(documentMock);
    vi.spyOn(documentMock, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'img') {
        const img = originalCreateElement('img');
        Object.defineProperty(img, 'naturalWidth', { value: 200, configurable: true });
        Object.defineProperty(img, 'naturalHeight', { value: 200, configurable: true });
        Object.defineProperty(img, 'src', {
          set: () => {
            setTimeout(() => {
              if (img.onload) {
                img.onload(new Event('load'));
              }
            }, 0);
          },
          configurable: true,
        });
        return img;
      }
      if (tagName === 'canvas') {
        return mockCanvas;
      }
      return originalCreateElement(tagName);
    });

    const options: ImageDownloadOptions = {
      url: 'data:image/png;base64,valid',
      crop: { xMin: 0, yMin: 0, xMax: 1, yMax: 1 },
      filterStyle: 'none',
      filename: 'test.png',
    };

    await expect(service.downloadFilteredCrop(options)).rejects.toThrow('Failed to get 2D canvas context.');
  });

  it('should reject when canvas export produces null blob', async () => {
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue({ filter: '', drawImage: vi.fn() }),
      toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
        callback(null);
      }),
    } as unknown as HTMLCanvasElement;

    const originalCreateElement = documentMock.createElement.bind(documentMock);
    vi.spyOn(documentMock, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'img') {
        const img = originalCreateElement('img');
        Object.defineProperty(img, 'naturalWidth', { value: 200, configurable: true });
        Object.defineProperty(img, 'naturalHeight', { value: 200, configurable: true });
        Object.defineProperty(img, 'src', {
          set: () => {
            setTimeout(() => {
              if (img.onload) {
                img.onload(new Event('load'));
              }
            }, 0);
          },
          configurable: true,
        });
        return img;
      }
      if (tagName === 'canvas') {
        return mockCanvas;
      }
      return originalCreateElement(tagName);
    });

    const options: ImageDownloadOptions = {
      url: 'data:image/png;base64,valid',
      crop: { xMin: 0, yMin: 0, xMax: 1, yMax: 1 },
      filterStyle: 'none',
      filename: 'test.png',
    };

    await expect(service.downloadFilteredCrop(options)).rejects.toThrow(
      'Canvas export failed to produce a valid Blob.',
    );
  });

  it('should sanitize non-ASCII or missing extension filenames to safe .png names', async () => {
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;

    const originalCreateElement = documentMock.createElement.bind(documentMock);
    vi.spyOn(documentMock, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'img') {
        const img = originalCreateElement('img');
        Object.defineProperty(img, 'naturalWidth', { value: 200, configurable: true });
        Object.defineProperty(img, 'naturalHeight', { value: 200, configurable: true });
        Object.defineProperty(img, 'src', {
          set: () => {
            setTimeout(() => {
              if (img.onload) {
                img.onload(new Event('load'));
              }
            }, 0);
          },
          configurable: true,
        });
        return img;
      }
      if (tagName === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn().mockReturnValue({ filter: '', drawImage: vi.fn() }),
          toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
            callback(new Blob(['data'], { type: 'image/png' }));
          }),
        } as unknown as HTMLCanvasElement;
      }
      if (tagName === 'a') {
        return mockAnchor;
      }
      return originalCreateElement(tagName);
    });

    // Test non-English name
    await service.downloadFilteredCrop({
      url: 'data:image/png;base64,valid',
      crop: { xMin: 0, yMin: 0, xMax: 1, yMax: 1 },
      filterStyle: 'none',
      filename: '測試圖片.jpeg',
    });
    expect(mockAnchor.download).toBe('enhanced-image.png');

    // Test name without extension
    await service.downloadFilteredCrop({
      url: 'data:image/png;base64,valid',
      crop: { xMin: 0, yMin: 0, xMax: 1, yMax: 1 },
      filterStyle: 'none',
      filename: 'landscape-view',
    });
    expect(mockAnchor.download).toBe('landscape-view.png');
  });

  it('should quantize floating-point crop coordinates and canvas dimensions to integer pixels', async () => {
    const mockDrawImage = vi.fn();
    const mockCtx = {
      filter: '',
      drawImage: mockDrawImage,
    } as unknown as CanvasRenderingContext2D;

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
      toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
        callback(new Blob(['fake-png-content'], { type: 'image/png' }));
      }),
    } as unknown as HTMLCanvasElement;

    const originalCreateElement = documentMock.createElement.bind(documentMock);
    vi.spyOn(documentMock, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'img') {
        const img = originalCreateElement('img');
        Object.defineProperty(img, 'naturalWidth', { value: 500, configurable: true });
        Object.defineProperty(img, 'naturalHeight', { value: 300, configurable: true });
        let srcValue = '';
        Object.defineProperty(img, 'src', {
          get: () => srcValue,
          set: (val: string) => {
            srcValue = val;
            setTimeout(() => {
              if (img.onload) {
                img.onload(new Event('load'));
              }
            }, 0);
          },
          configurable: true,
        });
        return img;
      }
      if (tagName === 'canvas') {
        return mockCanvas;
      }
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: vi.fn(),
        } as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tagName);
    });

    const options: ImageDownloadOptions = {
      url: 'data:image/png;base64,validbase64image',
      // (0.8 - 0.2) * 500 = 300.00000000000006 in standard IEEE-754 arithmetic
      crop: { xMin: 0.2, yMin: 0.1, xMax: 0.8, yMax: 0.7 },
      filterStyle: 'none',
      filename: 'quantized-test.png',
    };

    await service.downloadFilteredCrop(options);

    // Verify canvas dimensions are exact integer numbers
    expect(mockCanvas.width).toBe(300);
    expect(mockCanvas.height).toBe(180);

    // Verify source offsets and destination dimensions in drawImage call
    expect(mockDrawImage).toHaveBeenCalledWith(
      expect.any(Object),
      100, // sx: Math.round(0.2 * 500)
      30, // sy: Math.round(0.1 * 300)
      300, // cropWidth
      180, // cropHeight
      0,
      0,
      300, // cropWidth
      180, // cropHeight
    );
  });

  it('should apply "none" filter when filterStyle is empty', async () => {
    const mockCtx = {
      filter: '',
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
      toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
        callback(new Blob(['fake-png-content'], { type: 'image/png' }));
      }),
    } as unknown as HTMLCanvasElement;

    const originalCreateElement = documentMock.createElement.bind(documentMock);
    vi.spyOn(documentMock, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'img') {
        const img = originalCreateElement('img');
        Object.defineProperty(img, 'naturalWidth', { value: 100, configurable: true });
        Object.defineProperty(img, 'naturalHeight', { value: 100, configurable: true });
        let srcValue = '';
        Object.defineProperty(img, 'src', {
          get: () => srcValue,
          set: (val: string) => {
            srcValue = val;
            setTimeout(() => {
              if (img.onload) {
                img.onload(new Event('load'));
              }
            }, 0);
          },
          configurable: true,
        });
        return img;
      }
      if (tagName === 'canvas') {
        return mockCanvas;
      }
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: vi.fn(),
        } as unknown as HTMLAnchorElement;
      }
      return originalCreateElement(tagName);
    });

    await service.downloadFilteredCrop({
      url: 'data:image/png;base64,valid',
      crop: { xMin: 0, yMin: 0, xMax: 1, yMax: 1 },
      filterStyle: '',
      filename: 'plain.png',
    });

    expect(mockCtx.filter).toBe('none');
  });
});
