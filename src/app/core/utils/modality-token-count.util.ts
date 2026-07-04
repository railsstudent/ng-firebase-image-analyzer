import { Modality, ModalityTokenCount } from 'firebase/ai';

export function findModalityTokenCount(tokenDetails: ModalityTokenCount[] | undefined, modality: Modality): number {
  const textDetail = tokenDetails?.find((d) => d.modality === modality);

  return textDetail?.tokenCount ?? 0;
}
