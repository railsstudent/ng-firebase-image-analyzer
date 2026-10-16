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

  onDragState(event: DragEvent, isDragging: boolean): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(isDragging);
  }

  private async handleFile(files?: FileList | null): Promise<void> {
    if (files && files.length > 0) {
      this.errorMessage.set(null);
      const file = files[0];
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
  }

  async onDrop(event: DragEvent): Promise<void> {
    this.onDragState(event, false);
    await this.handleFile(event.dataTransfer?.files);
  }

  openFilePicker(fileInput: HTMLInputElement, event?: Event): void {
    event?.preventDefault();
    this.filePickerOpened.emit();
    fileInput.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const inputElement = event.target as HTMLInputElement;
    await this.handleFile(inputElement.files);
  }

  removeImage(event: Event, fileInput?: HTMLInputElement): void {
    event.stopPropagation();
    if (fileInput) {
      fileInput.value = '';
    }
    this.imageUrl.set(null);
    this.errorMessage.set(null);
    this.fileSelected.emit(null);
  }
}
