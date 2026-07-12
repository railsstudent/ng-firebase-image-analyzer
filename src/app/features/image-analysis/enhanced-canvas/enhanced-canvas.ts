import { Component, computed, DOCUMENT, inject, input } from '@angular/core';
import { CropImageStyles } from './../../image-enhancer/types/crop-image.type';

@Component({
  selector: 'app-enhanced-canvas',
  templateUrl: './enhanced-canvas.html',
  styleUrl: './enhanced-canvas.css',
})
export class EnhancedCanvas {
  imageUrl = input<string | null>(null);
  cropImage = input.required<CropImageStyles>();
  filterStyle = input.required<string>();

  document = inject(DOCUMENT);

  containerCss = computed(() => this.cropImage().containerStyle);
  imageCss = computed(() => this.cropImage().imageStyle);
}
