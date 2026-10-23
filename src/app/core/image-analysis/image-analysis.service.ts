import { AiService, FALLBACK_IMAGE_SIZE, type PartialResponse } from '@/core/firebase';
import { inject, Service } from '@angular/core';
import { Part } from 'firebase/ai';
import { ImageAnalysisResponse, StreamingAnalysisWithMetadata } from './image-analysis.interface';
import { IMAGE_ANALYSIS_USER_PROMPT, SYSTEM_INSTRUCTION } from './image-analysis.prompt';
import { ImageAnalysisSchema } from './image-analysis.schema';
import { readFileAsDataURL, resizeToFixedDimensions, validateImageInput, validatePrompt } from './image.util';

@Service()
export class ImageAnalysisService {
  #aiService = inject(AiService);

  async preWarm(): Promise<void> {
    try {
      await this.#aiService.preWarmModel(
        {
          systemInstruction: SYSTEM_INSTRUCTION,
          schema: ImageAnalysisSchema,
          contents: [],
        },
        {
          runDummyQuery: true,
          dummySize: 512,
        },
      );
      console.log('Image analysis on-device engine and WebGPU shaders warmed successfully!');
    } catch (err) {
      console.warn('Image analysis pre-warm sequence finished with warning/skip:', err);
    }
  }

  /**
   * Analyzes an image and returns alternative texts, tags, recommendations, and optional styling recommendations.
   *
   * @param file The image File or Blob to analyze.
   * @param customPrompt Optional custom prompt to guide the AI model's analysis.
   * @returns A structured ImageAnalysisResponse object.
   */
  async *analyzeImageStream(file: File | Blob, customPrompt?: string): AsyncGenerator<StreamingAnalysisWithMetadata> {
    validateImageInput(file);
    validatePrompt(customPrompt);

    const optimizedFile = await resizeToFixedDimensions(file, FALLBACK_IMAGE_SIZE);
    const imagePart = await this.fileToGenerativePart(optimizedFile);
    const userPrompt = customPrompt ? customPrompt : IMAGE_ANALYSIS_USER_PROMPT;

    const generator = await this.#aiService.generateContentStream<ImageAnalysisResponse>({
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [userPrompt, imagePart],
      schema: ImageAnalysisSchema,
    });

    for await (const update of generator) {
      const inferenceMetadata = update.inferenceMetadata || {
        source: 'on_device',
        thoughtSummary: 'No thought summary',
      };
      const analysis = this.constructAnalysis(update);

      yield {
        ...inferenceMetadata,
        analysis,
      };
    }
  }

  private constructAnalysis(update: PartialResponse<ImageAnalysisResponse>): Partial<ImageAnalysisResponse> {
    const partialData = update.partialData || {};
    return {
      alternativeTexts: partialData.alternativeTexts,
      tags: partialData.tags,
      recommendations: partialData.recommendations,
      colorAdjustment: partialData.colorAdjustment,
      crop: partialData.crop,
    };
  }

  private async fileToGenerativePart(file: File | Blob, mimeType?: string): Promise<Part> {
    const resolvedMimeType = mimeType || file.type;
    if (!resolvedMimeType) {
      throw new Error('MIME type must be specified or present on the File/Blob.');
    }

    const dataUrl = await readFileAsDataURL(file);
    const base64Data = dataUrl.split(',')[1];

    return {
      type: 'inlineData',
      inlineData: {
        data: base64Data,
        mimeType: resolvedMimeType,
      },
    };
  }
}
