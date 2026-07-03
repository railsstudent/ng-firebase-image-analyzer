import { Component, model, input, output, signal, ChangeDetectionStrategy } from '@angular/core';

const MAX_FILE_SIZE_MB = 20 * 1024 * 1024; // Default max file size in MB

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  templateUrl: './image-uploader.html',
  styleUrl: './image-uploader.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploader {
  imageUrl = model<string | null>(null);
  maxSize = input<number>(MAX_FILE_SIZE_MB); // Default 20MB

  fileSelected = output<File>();
  imageRemoved = output<void>();

  isDragging = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  handleFile(file: File) {
    this.errorMessage.set(null);

    if (file.size > this.maxSize()) {
      const sizeInMb = (this.maxSize() / (1024 * 1024)).toFixed(0);
      this.errorMessage.set(`File too large (Max ${sizeInMb}MB)`);
      return;
    }

    this.fileSelected.emit(file);

    // Read file for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.imageUrl.set(null);
    this.errorMessage.set(null);
    this.imageRemoved.emit();
  }
}
