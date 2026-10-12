import type { StreamingAnalysisWithMetadata } from '@/core/image-analysis';
import { ErrorIconComponent } from '@/shared/ui/icons/error-icon/error-icon.component';
import { PsychologyIconComponent } from '@/shared/ui/icons/psychology-icon/psychology-icon.component';
import { SyncIconComponent } from '@/shared/ui/icons/sync-icon/sync-icon.component';
import { ImageUploaderComponent } from '@/shared/ui/image-uploader/image-uploader.component';
import { Component, computed, injectAsync, signal } from '@angular/core';
import { InferenceSource } from 'firebase/ai';
import { ImageAnalysisPanelComponent } from './image-analysis-panel/image-analysis-panel.component';
import { ImageTag } from './tag-list/interfaces/image-tag.interface';
import { TagListComponent } from './tag-list/tag-list.component';

const MILLISECONDS = 1000;

@Component({
  selector: 'app-image-analysis',
  imports: [
    ImageUploaderComponent,
    TagListComponent,
    ImageAnalysisPanelComponent,
    ErrorIconComponent,
    PsychologyIconComponent,
    SyncIconComponent,
  ],
  templateUrl: './image-analysis.component.html',
  styleUrl: './image-analysis.component.css',
})
export default class ImageAnalysisComponent {
  // Inject the actual neural analysis service
  readonly #asyncImageAnalysisService = injectAsync(() =>
    import('@/core/image-analysis/image-analysis.service').then((m) => m.ImageAnalysisService),
  );

  // Local reactive states
  imageUrl = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  analysisData = signal<StreamingAnalysisWithMetadata | null>(null);
  isLoading = signal(false);
  performance = signal(0);
  errorMessage = signal('');
  seconds = computed(() => (this.performance() / MILLISECONDS).toFixed(1));

  // Computed derived states
  tags = computed<ImageTag[]>(() => {
    const data = this.analysisData();
    if (!data) {
      return [];
    }
    return (data.analysis.tags || []).map((t) => ({
      label: t.name,
      tooltip: t.sentence,
    }));
  });

  source = computed<InferenceSource | undefined>(() => this.analysisData()?.source);

  async preWarm(): Promise<void> {
    try {
      const imageAnalysisService = await this.#asyncImageAnalysisService();
      await imageAnalysisService.preWarm();
      console.log('Gemini Nano pre-warmed and ready for action!');
    } catch (err: unknown) {
      console.warn('Model pre-warming skipped, falling back to cloud dynamically.', err);
    }
  }

  onFileSelected(file: File | null) {
    if (file) {
      this.preWarm().catch((err: unknown) => console.warn('Pre-warm failed on file selection:', err));
    }
    this.selectedFile.set(file);
    this.analysisData.set(null);
    this.errorMessage.set('');
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
      this.errorMessage.set('');

      // Call the service to perform live AI analysis
      const imageAnalysisService = await this.#asyncImageAnalysisService();
      const stream = await imageAnalysisService.analyzeImageStream(file);

      // Stream the image analysis data that consists of partial data
      for await (const update of stream) {
        this.analysisData.set(update);
        this.performance.set(Date.now() - start);
      }
    } catch (error) {
      console.error('Failed to analyze image with API', error);
      const message = error instanceof Error ? error.message : 'Unknown error occurred during image analysis.';
      this.errorMessage.set(`Failed to analyze image: ${message}`);
    } finally {
      this.isLoading.set(false);
      this.performance.set(Date.now() - start);
    }
  }
}
