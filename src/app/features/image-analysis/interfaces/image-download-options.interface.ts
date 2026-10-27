import type { Crop } from '@/core/image-analysis';

export interface ImageDownloadOptions {
  url: string;
  crop: Crop;
  filterStyle: string;
  filename: string;
}
