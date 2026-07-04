import { Footer } from '@/shared/ui/layout/footer/footer';
import { Header } from '@/shared/ui/layout/header/header';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // #catResource = httpResource.blob(() => 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Cat03.jpg');
  // cat = computed(() => (this.#catResource.hasValue() ? this.#catResource.value() : undefined));
  // catURL = linkedSignal<Blob | undefined, string>({
  //   source: () => this.cat(),
  //   computation: (data, previous) => {
  //     if (previous?.value) {
  //       URL.revokeObjectURL(previous?.value);
  //     }
  //     if (data) {
  //       return URL.createObjectURL(data);
  //     }
  //     return '';
  //   },
  // });
  // finalAnalysis = signal<ImageAnalysisWithMetadata | undefined>(undefined);
  // duration = signal(0);
  // cssFilterFunctions = signal('');
  // isAnalysisInProgress = signal(false);
  // cropCss = signal<CropImageStyles | undefined>(undefined);
  // containerCss = computed(() => this.cropCss()?.containerStyle);
  // imageCss = computed(() => this.cropCss()?.imageStyle);
  // imageAnalysisService = inject(ImageAnalysis);
  // cssFilterService = inject(ImageEffect);
  // async testImageAnalysis(event: Event) {
  //   event.preventDefault();
  //   const start = Date.now();
  //   this.finalAnalysis.set(undefined);
  //   this.cssFilterFunctions.set('');
  //   this.cropCss.set(undefined);
  //   this.duration.set(0);
  //   const catBlob = this.cat();
  //   if (catBlob) {
  //     try {
  //       this.isAnalysisInProgress.set(true);
  //       const response = await this.imageAnalysisService.analyzeImage(catBlob);
  //       this.finalAnalysis.set(response);
  //       const cssFilter = this.cssFilterService.getCssFilter(response.analysis.colorAdjustment);
  //       this.cssFilterFunctions.set(cssFilter);
  //       const cropInfo = this.cssFilterService.cropImage(response.analysis.crop);
  //       this.cropCss.set(cropInfo);
  //     } finally {
  //       this.isAnalysisInProgress.set(false);
  //       this.duration.set(Date.now() - start);
  //     }
  //   } else {
  //     console.log('no blob to analyze');
  //   }
  // }
}
