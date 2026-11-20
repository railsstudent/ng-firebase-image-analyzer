import type { Crop } from '@/core/image-analysis';

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
}

export interface AppliedFilterItem {
  label: string;
  value: number | string;
}

export interface VisualCalibrationResult {
  safeCrop: Crop | undefined;
  appliedFilters: AppliedFilterItem[];
  cropPosition: string;
  filterStyle: string;
}
