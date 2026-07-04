import { ImageAnalysisService } from '@/features/image-analysis/services/image-analysis';
import { ImageAnalysisWithMetadata } from '@/features/image-analysis/types/image-analysis-metadata.type';
import { ImageUploader } from '@/shared/image-uploader/image-uploader';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { InferenceSource } from 'firebase/ai';
import { ImageAnalysisPanel } from './image-analysis-panel/image-analysis-panel';
import { ImageTag, TagList } from './tag-list/tag-list';

@Component({
  selector: 'app-image-analysis',
  standalone: true,
  imports: [CommonModule, ImageUploader, TagList, ImageAnalysisPanel],
  templateUrl: './image-analysis.html',
  styleUrl: './image-analysis.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ImageAnalysis {
  // Inject the actual neural analysis service
  imageAnalysisService = inject(ImageAnalysisService);

  // Local reactive states
  imageUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  tags = signal<ImageTag[]>([]);
  analysisData = signal<ImageAnalysisWithMetadata | null>(null);
  isLoading = signal<boolean>(false);
  performance = signal(0);
  source = signal<InferenceSource | undefined>(undefined);

  onFileSelected(file: File) {
    this.selectedFile.set(file);
    this.tags.set([]);
    this.analysisData.set(null);
  }

  async triggerAnalysis() {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    const start = Date.now();
    try {
      this.performance.set(0);
      this.isLoading.set(true);

      // Call the service to perform live AI analysis
      const response = await this.imageAnalysisService.analyzeImage(file);

      // Map API tags to TagList model
      this.tags.set(
        response.analysis.tags.map((t) => ({
          label: t.name,
          tooltip: t.sentence,
        })),
      );

      this.source.set(response.source);

      // Store response directly to be bound in the panel
      this.analysisData.set(response);
    } catch (error) {
      console.error('Failed to analyze image with API', error);
    } finally {
      this.isLoading.set(false);
      this.performance.set(Date.now() - start);
    }
  }

  onImageRemoved() {
    this.selectedFile.set(null);
    this.tags.set([]);
    this.analysisData.set(null);
  }
}
