import { ColorAdjustment } from './color-adjustment.interface';
import { Crop } from './crop.interface';

export interface ImageDownloadOptions {
  url: string;
  crop: Crop;
  filter: ColorAdjustment | undefined;
  filename: string;
}
