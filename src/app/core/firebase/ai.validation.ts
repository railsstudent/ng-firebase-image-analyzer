import type { GenerateContentResponse } from 'firebase/ai';

function validateArrayItem(item: unknown): void {
  if (item === null || item === undefined) {
    throw new Error('Input contents array cannot contain null or undefined elements.');
  }
  if (typeof item === 'string' && item.trim() === '') {
    throw new Error('Input contents array cannot contain empty or whitespace strings.');
  }
  if (typeof item === 'object' && Object.keys(item).length === 0) {
    throw new Error('Input contents array cannot contain empty Part objects.');
  }
}

/**
 * Validates that input contents for Gemini inference are non-empty and well-formed.
 * Employs an exhaustive assertion chain with zero return statements.
 */
export function validateAiInputs(contents: unknown): void {
  if (contents === null || contents === undefined) {
    throw new Error('Input contents cannot be null or undefined.');
  }

  if (typeof contents === 'string') {
    if (contents.trim() === '') {
      throw new Error('Input string contents cannot be empty or whitespace.');
    }
  } else if (Array.isArray(contents)) {
    if (contents.length === 0) {
      throw new Error('Input contents array cannot be empty.');
    }
    contents.forEach(validateArrayItem);
  } else if (typeof contents === 'object') {
    if (Object.keys(contents).length === 0) {
      throw new Error('Input Part object cannot be empty.');
    }
  } else {
    throw new Error('Invalid input contents type.');
  }
}

/**
 * Validates that the Generative AI response contains valid candidates that completed normally.
 */
export function validateAiResponse(response: GenerateContentResponse): void {
  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('Response candidates are empty or undefined.');
  }

  const firstCandidate = response.candidates[0];
  if (firstCandidate.finishReason && firstCandidate.finishReason !== 'STOP') {
    throw new Error(`Response generation did not finish normally. Reason: ${firstCandidate.finishReason}`);
  }
}
