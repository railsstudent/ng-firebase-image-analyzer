import { ColorAdjustment, Crop } from '@/core/image-analysis';

export interface ImageDownloadOptions {
  url: string;
  crop: Crop;
  filter: ColorAdjustment | undefined;
  filename: string;
}
