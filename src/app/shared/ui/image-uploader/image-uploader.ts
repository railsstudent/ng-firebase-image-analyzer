import { readFileAsDataURL } from '@/core/utils/base64.util';
import { Component, input, model, output, signal } from '@angular/core';

const ONE_MB = 1024 * 1024;
const MAX_FILE_SIZE_MB = 20 * ONE_MB; // Default max file size in MB

@Component({
  selector: 'app-image-uploader',
  templateUrl: './image-uploader.html',
  styleUrl: './image-uploader.css',
})
export class ImageUploader {
  imageUrl = model<string | null>(null);
  maxSize = input<number>(MAX_FILE_SIZE_MB); // Default 20MB
  disabled = input<boolean>(false);
  warmingMessage = input<string | null>(null);

  fileSelected = output<File>();
  imageRemoved = output<void>();

  isDragging = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  onDragOver(event: DragEvent) {
    if (this.disabled()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    if (this.disabled()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    if (this.disabled()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    if (this.disabled()) {
      return;
    }
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  async handleFile(file: File) {
    this.errorMessage.set(null);

    if (file.size > this.maxSize()) {
      const sizeInMb = (this.maxSize() / ONE_MB).toFixed(0);
      this.errorMessage.set(`File too large (Max ${sizeInMb}MB)`);
      return;
    }

    this.fileSelected.emit(file);

    // Read file for preview using the unified helper
    try {
      const dataUrl = await readFileAsDataURL(file);
      this.imageUrl.set(dataUrl);
    } catch (error) {
      console.error('Failed to read file as data URL', error);
      this.errorMessage.set('Failed to read image preview.');
    }
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.imageUrl.set(null);
    this.errorMessage.set(null);
    this.imageRemoved.emit();
  }
}
