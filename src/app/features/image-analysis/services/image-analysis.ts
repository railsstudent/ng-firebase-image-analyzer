import { fileToGenerativePart } from '@/core/utils/base64.util';
import { resizeToFixedDimensions, validateImageInput, validatePrompt } from '@/core/utils/image.util';
import { AiService } from '@/features/ai/services/ai.service';
import { ImageAnalysisSchema } from '@/features/image-analysis/schemas/image-analysis.schema';
import {
  ImageAnalysisResponse,
  ImageAnalysisWithMetadata,
  StreamingAnalysisWithMetadata,
} from '@/features/image-analysis/types/image-analysis-metadata.type';
import { inject, Service } from '@angular/core';
import { IMAGE_ANALYSIS_USER_PROMPT, SYSTEM_INSTRUCTION } from '../prompts/image-analysis.prompt';
import { SanitizeAdjustmentService } from './sanitize-adjustment';

@Service()
export class ImageAnalysisService {
  #aiService = inject(AiService);
  #sanitizeAdjustment = inject(SanitizeAdjustmentService);

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
  async analyzeImage(file: File | Blob, customPrompt?: string): Promise<ImageAnalysisWithMetadata> {
    // 1. Validate inputs
    validateImageInput(file);
    validatePrompt(customPrompt);

    // 2. Resize in-memory to exactly 512x512 for optimal WebGPU tensor shape matching
    const optimizedFile = await resizeToFixedDimensions(file, 512);

    // 3. Convert File/Blob to base64 generative Part
    const imagePart = await fileToGenerativePart(optimizedFile);

    // 3. Formulate the prompt/instructions
    const userPrompt = customPrompt ? customPrompt : IMAGE_ANALYSIS_USER_PROMPT;

    // 4. Generate structured content
    const response = await this.#aiService.generateContent({
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [userPrompt, imagePart],
      schema: ImageAnalysisSchema,
    });

    // 5. Parse and return the JSON response
    const jsonText = response.text();
    if (!jsonText) {
      throw new Error('AI response contains no text data.');
    }

    try {
      const analysis = JSON.parse(jsonText) as ImageAnalysisResponse;
      if (analysis.colorAdjustment) {
        analysis.colorAdjustment = this.#sanitizeAdjustment.sanitizeColorAdjustments(analysis.colorAdjustment);
      }
      if (analysis.crop) {
        analysis.crop = this.#sanitizeAdjustment.sanitizeCrop(analysis.crop);
      }
      const usageGroup = this.#aiService.processUsage(response);
      return {
        analysis,
        source: response.inferenceSource,
        thoughtSummary: response.thoughtSummary(),
        tokenSummary: usageGroup?.tokenSummary,
        tokenModalityBreakdown: usageGroup?.tokenBreakdown,
      };
    } catch (error) {
      throw new Error(`Failed to parse AI response as JSON: ${(error as Error).message}`, { cause: error });
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
    // 1. Validate inputs
    validateImageInput(file);
    validatePrompt(customPrompt);

    // 2. Resize in-memory to exactly 512x512 for optimal WebGPU tensor shape matching
    const optimizedFile = await resizeToFixedDimensions(file, 512);

    // 3. Convert File/Blob to base64 generative Part
    const imagePart = await fileToGenerativePart(optimizedFile);

    // 3. Formulate the prompt/instructions
    const userPrompt = customPrompt ? customPrompt : IMAGE_ANALYSIS_USER_PROMPT;

    // 4. Generate structured content
    const generator = await this.#aiService.generateContentStream<ImageAnalysisResponse>({
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [userPrompt, imagePart],
      schema: ImageAnalysisSchema,
    });

    for await (const update of generator) {
      const response = update.response;
      const usageGroup = response ? this.#aiService.processUsage(response) : undefined;
      const partialData = update.partialData;
      const analysis: Partial<ImageAnalysisResponse> = {
        alternativeTexts: partialData?.alternativeTexts,
        tags: partialData?.tags,
        recommendations: partialData?.recommendations,
        colorAdjustment: partialData?.colorAdjustment,
        crop: partialData?.crop,
      };

      yield {
        analysis,
        source: response?.inferenceSource ?? 'on_device',
        thoughtSummary: response?.thoughtSummary() ?? 'No thought summary',
        tokenSummary: usageGroup?.tokenSummary,
        tokenModalityBreakdown: usageGroup?.tokenBreakdown,
      };
    }
  }
}
