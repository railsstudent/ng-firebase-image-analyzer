import {
  AiService,
  FALLBACK_IMAGE_SIZE,
  PartialResponse,
  TokenModalityBreakdown,
  TokenSummary,
  ZERO_TOKEN_SUMMARY,
} from '@/core/firebase';
import { inject, Service } from '@angular/core';
import { InferenceSource, Part } from 'firebase/ai';
import { ImageAnalysisResponse, StreamingAnalysisWithMetadata } from './image-analysis.interface';
import { IMAGE_ANALYSIS_USER_PROMPT, SYSTEM_INSTRUCTION } from './image-analysis.prompt';
import { ImageAnalysisSchema } from './image-analysis.schema';
import { readFileAsDataURL, resizeToFixedDimensions, validateImageInput, validatePrompt } from './image.util';

@Service()
export class ImageAnalysisService {
  #aiService = inject(AiService);
  #preWarmPromise: Promise<void> | null = null;

  preWarm(): Promise<void> {
    if (!this.#preWarmPromise) {
      this.#preWarmPromise = this.loadPreWarm();
    }
    return this.#preWarmPromise;
  }

  private async loadPreWarm(): Promise<void> {
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
      this.#preWarmPromise = null;
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
      const response = update.response;
      const analysis = this.constructAnalysis(update);

      let source: InferenceSource = 'on_device';
      let thoughtSummary = 'No thought summary';
      let tokenSummary: TokenSummary | undefined = undefined;
      let tokenModalityBreakdown: TokenModalityBreakdown | undefined = undefined;
      if (response) {
        source = response.inferenceSource || 'on_device';
        thoughtSummary = response.thoughtSummary() || 'No thought summary';
        const usageGroup = this.#aiService.processUsage(response);
        tokenSummary = usageGroup?.tokenSummary ?? ZERO_TOKEN_SUMMARY;
        tokenModalityBreakdown = usageGroup?.tokenBreakdown;
      }

      yield {
        analysis,
        source,
        thoughtSummary,
        tokenSummary,
        tokenModalityBreakdown,
      };
    }
  }

  private constructAnalysis(update: PartialResponse<ImageAnalysisResponse>) {
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
      inlineData: {
        data: base64Data,
        mimeType: resolvedMimeType,
      },
    };
  }
}
