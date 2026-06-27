import { ImageAnalysisService } from '@/features/image-analysis/services/image-analysis.service';
import { ImageAnalysisResponse } from '@/features/image-analysis/types/image-analysis.type';
import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  #catResource = httpResource.blob(() => 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg');

  cat = computed(() => (this.#catResource.hasValue() ? this.#catResource.value() : undefined));
  analyze = signal<ImageAnalysisResponse | undefined>(undefined);

  imageAnalysisService = inject(ImageAnalysisService);

  async testImageAnalysis(event: Event) {
    event.preventDefault();
    const catBlob = this.cat();
    if (catBlob) {
      const response = await this.imageAnalysisService.analyzeImage(catBlob);
      this.analyze.set(response);
    } else {
      console.log('no blob to analyze');
    }
  }
}
