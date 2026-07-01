import { ImageAnalysisService } from '@/features/image-analysis/services/image-analysis.service';
import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ImageAnalysisWithMetadata } from './features/image-analysis/types/image-analysis-metadata.type';
import { HeaderComponent } from '@/shared/ui/layout/header/header';
import { FooterComponent } from '@/shared/ui/layout/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  #catResource = httpResource.blob(() => 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg');

  cat = computed(() => (this.#catResource.hasValue() ? this.#catResource.value() : undefined));
  catURL = linkedSignal<Blob | undefined, string>({
    source: () => this.cat(),
    computation: (data, previous) => {
      if (previous?.value) {
        URL.revokeObjectURL(previous?.value);
      }

      if (data) {
        return URL.createObjectURL(data);
      }

      return '';
    },
  });

  finalAnalysis = signal<ImageAnalysisWithMetadata | undefined>(undefined);
  duration = signal(0);

  imageAnalysisService = inject(ImageAnalysisService);

  async testImageAnalysis(event: Event) {
    event.preventDefault();
    this.finalAnalysis.set(undefined);
    const catBlob = this.cat();
    this.duration.set(0);
    const start = Date.now();
    if (catBlob) {
      const response = await this.imageAnalysisService.analyzeImage(catBlob);
      this.finalAnalysis.set(response);
      this.duration.set(Date.now() - start);
    } else {
      console.log('no blob to analyze');
    }
  }
}
