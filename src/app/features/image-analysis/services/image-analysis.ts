import { FALLBACK_IMAGE_SIZE } from '@/core/ai/constants/image.const';
import { AiService } from '@/core/ai/services/ai.service';
import { fileToGenerativePart } from '@/core/utils/base64.util';
import { resizeToFixedDimensions, validateImageInput, validatePrompt } from '@/core/utils/image.util';
import {
  IMAGE_ANALYSIS_USER_PROMPT,
  SYSTEM_INSTRUCTION,
} from '@/features/image-analysis/prompts/image-analysis.prompt';
import { ImageAnalysisSchema } from '@/features/image-analysis/schemas/image-analysis.schema';
import {
  ImageAnalysisResponse,
  StreamingAnalysisWithMetadata,
} from '@/features/image-analysis/types/image-analysis-metadata.type';
import { inject, Service } from '@angular/core';
import { InferenceSource } from 'firebase/ai';

@Service()
export class ImageAnalysisService {
  #aiService = inject(AiService);

  public readonly warmingMessage = this.#aiService.warmingStatus;

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

    const imagePart = await fileToGenerativePart(optimizedFile);

    const userPrompt = customPrompt ? customPrompt : IMAGE_ANALYSIS_USER_PROMPT;

    const generator = await this.#aiService.generateContentStream<ImageAnalysisResponse>({
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [userPrompt, imagePart],
      schema: ImageAnalysisSchema,
    });

    for await (const update of generator) {
      const response = update.response;
      const usageGroup = response ? this.#aiService.processUsage(response) : undefined;
      const partialData = update.partialData || {};
      const analysis = {
        alternativeTexts: partialData.alternativeTexts,
        tags: partialData.tags,
        recommendations: partialData.recommendations,
        colorAdjustment: partialData.colorAdjustment,
        crop: partialData.crop,
      };

      let source: InferenceSource = 'on_device';
      let thoughtSummary = 'No thought summary';
      if (response) {
        source = response.inferenceSource || 'on_device';
        thoughtSummary = response.thoughtSummary() || 'No thought summary';
      }

      yield {
        analysis,
        source,
        thoughtSummary,
        tokenSummary: usageGroup ? usageGroup.tokenSummary : undefined,
        tokenModalityBreakdown: usageGroup ? usageGroup.tokenBreakdown : undefined,
      };
    }
  }
}
