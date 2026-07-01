import { ImageAnalysisService } from '@/features/image-analysis/services/image-analysis.service';
import { ImageAnalysisWithMetadata } from '@/features/image-analysis/types/image-analysis-metadata.type';
import { CssFilter } from '@/features/image-enhancer/services/css-filter';
import { FooterComponent } from '@/shared/ui/layout/footer/footer';
import { HeaderComponent } from '@/shared/ui/layout/header/header';
import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

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
  cssFilterFunctions = signal('');
  isAnalysisInProgress = signal(false);

  imageAnalysisService = inject(ImageAnalysisService);
  cssFilterService = inject(CssFilter);

  async testImageAnalysis(event: Event) {
    event.preventDefault();
    const start = Date.now();

    this.finalAnalysis.set(undefined);
    this.cssFilterFunctions.set('');
    this.duration.set(0);
    const catBlob = this.cat();
    if (catBlob) {
      try {
        this.isAnalysisInProgress.set(true);

        const response = await this.imageAnalysisService.analyzeImage(catBlob);
        this.finalAnalysis.set(response);

        const cssFilter = this.cssFilterService.getFunctions(response.analysis.colorAdjustment);
        this.cssFilterFunctions.set(cssFilter);
      } finally {
        this.isAnalysisInProgress.set(false);
        this.duration.set(Date.now() - start);
      }
    } else {
      console.log('no blob to analyze');
    }
  }
}
