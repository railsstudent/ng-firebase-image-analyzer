import { readFileAsDataURL } from './file-reader.util';

describe('readFileAsDataURL', () => {
  it('should read a blob as base64 Data URL', async () => {
    const blob = new Blob(['hello world'], { type: 'text/plain' });
    const dataUrl = await readFileAsDataURL(blob);

    expect(dataUrl).toContain('data:text/plain;base64,');
  });

  it('should reject when FileReader encounters an error', async () => {
    const error = new Error('Read failure');
    const mockFile = new Blob(['sample']);

    const originalFileReader = window.FileReader;
    class MockFileReader {
      onerror: ((err: unknown) => void) | null = null;
      readAsDataURL() {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror(error);
          }
        }, 0);
      }
    }

    (window as unknown as { FileReader: unknown }).FileReader = MockFileReader;

    try {
      await expect(readFileAsDataURL(mockFile)).rejects.toThrow();
    } finally {
      (window as unknown as { FileReader: unknown }).FileReader = originalFileReader;
    }
  });
});
