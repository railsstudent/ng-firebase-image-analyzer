import { ColorAdjustment } from './color-adjustment.type';
import { Crop } from './crop.type';

export interface ImageDownloadOptions {
  url: string;
  crop: Crop;
  filter: ColorAdjustment | undefined;
  filename: string;
}
