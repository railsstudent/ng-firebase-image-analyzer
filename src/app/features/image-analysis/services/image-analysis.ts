import { fileToGenerativePart } from '@/core/utils/base64.util';
import { validateImageInput, validatePrompt } from '@/core/utils/image.util';
import { AiService } from '@/features/ai/services/ai.service';
import { ImageAnalysisSchema } from '@/features/image-analysis/schemas/image-analysis.schema';
import {
  ImageAnalysisResponse,
  ImageAnalysisWithMetadata,
} from '@/features/image-analysis/types/image-analysis-metadata.type';
import { inject, Service } from '@angular/core';
import { IMAGE_ANALYSIS_USER_PROMPT, SYSTEM_INSTRUCTION } from '../prompts/image-analysis.prompt';
import { SanitizeAdjustmentService } from './sanitize-adjustment';

@Service()
export class ImageAnalysisService {
  #aiService = inject(AiService);
  #sanitizeAdjustment = inject(SanitizeAdjustmentService);

  async preWarm(): Promise<void> {
    await this.#aiService.preWarmModel({
      systemInstruction: SYSTEM_INSTRUCTION,
      schema: ImageAnalysisSchema,
      contents: [],
    });
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

    // 2. Convert File/Blob to base64 generative Part
    const imagePart = await fileToGenerativePart(file);

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
  async analyzeImageStream(file: File | Blob, customPrompt?: string): Promise<void> {
    // 1. Validate inputs
    validateImageInput(file);
    validatePrompt(customPrompt);

    // 2. Convert File/Blob to base64 generative Part
    const imagePart = await fileToGenerativePart(file);

    // 3. Formulate the prompt/instructions
    const userPrompt = customPrompt ? customPrompt : IMAGE_ANALYSIS_USER_PROMPT;

    // 4. Generate structured content
    const result = await this.#aiService.generateContentStream({
      systemInstruction: SYSTEM_INSTRUCTION,
      contents: [userPrompt, imagePart],
      schema: ImageAnalysisSchema,
    });

    for await (const chunk of result.stream) {
      console.log(chunk.text());
    }
  }
}
