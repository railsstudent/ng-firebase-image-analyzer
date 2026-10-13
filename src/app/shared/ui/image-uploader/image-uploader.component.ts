import { MAX_FILE_SIZE_MB, ONE_MB } from '@/core/firebase';
import { readFileAsDataURL } from '@/core/image-analysis';
import { CloudUploadIconComponent } from '@/shared/ui/icons/cloud-upload-icon/cloud-upload-icon.component';
import { DeleteIconComponent } from '@/shared/ui/icons/delete-icon/delete-icon.component';
import { Component, input, model, output, signal } from '@angular/core';

@Component({
  selector: 'app-image-uploader',
  imports: [DeleteIconComponent, CloudUploadIconComponent],
  templateUrl: './image-uploader.component.html',
  styleUrl: './image-uploader.component.css',
})
export class ImageUploaderComponent {
  imageUrl = model<string | null>(null);
  maxSize = input<number>(MAX_FILE_SIZE_MB); // Default 20MB

  filePickerOpened = output();
  fileSelected = output<File | null>();

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

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      await this.handleFile(files[0]);
    }
  }

  openFilePicker(fileInput: HTMLInputElement) {
    this.filePickerOpened.emit();
    fileInput.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;
    if (files && files.length > 0) {
      await this.handleFile(files[0]);
    }
  }

  async handleFile(file: File): Promise<void> {
    this.errorMessage.set(null);

    if (file.size > this.maxSize()) {
      const sizeInMb = (this.maxSize() / ONE_MB).toFixed(0);
      this.errorMessage.set(`File too large (Max ${sizeInMb}MB)`);
      return;
    }

    this.fileSelected.emit(file);

    // Read file for preview using the shared helper
    try {
      const dataUrl = await readFileAsDataURL(file);
      this.imageUrl.set(dataUrl);
    } catch (error) {
      console.error('Failed to read file as data URL', error);
      this.errorMessage.set('Failed to read image preview.');
    }
  }

  removeImage(event: Event, fileInput?: HTMLInputElement) {
    event.stopPropagation();
    if (fileInput) {
      fileInput.value = '';
    }
    this.imageUrl.set(null);
    this.errorMessage.set(null);
    this.fileSelected.emit(null);
  }
}
