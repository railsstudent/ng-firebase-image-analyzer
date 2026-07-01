export interface ContainerStyle {
  width: string;
  aspectRatio: string;
  overflow: 'hidden';
  position: 'relative' | 'static';
}

export interface ImageStyle {
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
