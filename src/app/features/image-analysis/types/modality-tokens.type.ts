export interface BaseModalityTokens {
  textTokens: number;
  imageTokens: number;
}

export type ModalitySegments = BaseModalityTokens & {
  totalTokens: number;
};
