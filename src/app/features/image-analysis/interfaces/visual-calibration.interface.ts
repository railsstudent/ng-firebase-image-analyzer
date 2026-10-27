import type { ColorAdjustment, Crop } from '@/core/image-analysis';

interface ContainerStyle {
  width: string;
  aspectRatio: string;
  overflow: 'hidden';
  position: 'relative' | 'static';
}

interface ImageStyle {
  width: string;
  position: 'absolute' | 'static';
  top: string;
  left: string;
  maxWidth: 'none';
  maxHeight: 'none';
}

export interface CropImageStyles {
  containerStyle: ContainerStyle;
  imageStyle: ImageStyle;
  crop: Crop;
}

export interface VisualCalibrationResult {
  readonly safeCrop: Crop | undefined;
  readonly safeColorAdjustment: ColorAdjustment | undefined;
  readonly cropImage: CropImageStyles;
  readonly aspectRatio: string;
  readonly cropPosition: string;
  readonly filterStyle: string;
}
