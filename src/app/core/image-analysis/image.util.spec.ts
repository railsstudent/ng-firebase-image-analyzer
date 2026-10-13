import { readFileAsDataURL, validateImageInput, validatePrompt } from './image.util';

describe('image.util', () => {
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
        readAsDataURL(): void {
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

  describe('validateImageInput', () => {
    it('should throw when no file is provided', () => {
      expect(() => validateImageInput(null as unknown as File)).toThrow('Image file must be provided.');
    });

    it('should throw when file type is not an image', () => {
      const nonImageBlob = new Blob(['test'], { type: 'text/plain' });
      expect(() => validateImageInput(nonImageBlob)).toThrow('The file must be an image.');
    });

    it('should not throw for valid image blob', () => {
      const imageBlob = new Blob(['img data'], { type: 'image/png' });
      expect(() => validateImageInput(imageBlob)).not.toThrow();
    });
  });

  describe('validatePrompt', () => {
    it('should throw when prompt is empty or whitespace', () => {
      expect(() => validatePrompt('   ')).toThrow('Prompt cannot be empty or whitespace.');
    });

    it('should not throw when prompt is valid or undefined', () => {
      expect(() => validatePrompt('Analyze this image')).not.toThrow();
      expect(() => validatePrompt(undefined)).not.toThrow();
    });
  });
});
