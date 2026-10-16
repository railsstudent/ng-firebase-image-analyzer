import type { GenerateContentResponse, Part } from 'firebase/ai';
import { describe, expect, it } from 'vitest';
import { validateAiInputs, validateAiResponse } from './ai.validation';

describe('ai.validation', () => {
  describe('validateAiInputs', () => {
    describe('valid inputs', () => {
      it('accepts valid non-empty string', () => {
        expect(() => validateAiInputs('Describe this image')).not.toThrow();
      });

      it('accepts valid non-empty Part object', () => {
        const part: Part = { type: 'text', text: 'Hello' };
        expect(() => validateAiInputs(part)).not.toThrow();
      });

      it('accepts valid array of strings and Part objects', () => {
        const contents = ['Hello', { type: 'text', text: 'World' }];
        expect(() => validateAiInputs(contents)).not.toThrow();
      });
    });

    describe('invalid inputs - top-level checks', () => {
      it('throws when contents is null or undefined', () => {
        expect(() => validateAiInputs(null)).toThrow('Input contents cannot be null or undefined.');
        expect(() => validateAiInputs(undefined)).toThrow('Input contents cannot be null or undefined.');
      });

      it('throws when contents is empty or whitespace string', () => {
        expect(() => validateAiInputs('')).toThrow('Input string contents cannot be empty or whitespace.');
        expect(() => validateAiInputs('   ')).toThrow('Input string contents cannot be empty or whitespace.');
      });

      it('throws when contents is an empty Part object', () => {
        expect(() => validateAiInputs({})).toThrow('Input Part object cannot be empty.');
      });

      it('throws when contents is an unsupported primitive or type', () => {
        expect(() => validateAiInputs(123)).toThrow('Invalid input contents type.');
        expect(() => validateAiInputs(true)).toThrow('Invalid input contents type.');
        /* eslint-disable-next-line @typescript-eslint/no-empty-function */
        expect(() => validateAiInputs(() => {})).toThrow('Invalid input contents type.');
      });
    });

    describe('invalid inputs - array checks', () => {
      it('throws when contents array is empty', () => {
        expect(() => validateAiInputs([])).toThrow('Input contents array cannot be empty.');
      });

      it('throws when contents array contains null or undefined', () => {
        expect(() => validateAiInputs(['valid', null])).toThrow(
          'Input contents array cannot contain null or undefined elements.',
        );
        expect(() => validateAiInputs([undefined])).toThrow(
          'Input contents array cannot contain null or undefined elements.',
        );
      });

      it('throws when contents array contains empty or whitespace string', () => {
        expect(() => validateAiInputs(['valid', ''])).toThrow(
          'Input contents array cannot contain empty or whitespace strings.',
        );
        expect(() => validateAiInputs(['  '])).toThrow(
          'Input contents array cannot contain empty or whitespace strings.',
        );
      });

      it('throws when contents array contains empty Part object', () => {
        expect(() => validateAiInputs(['valid', {}])).toThrow(
          'Input contents array cannot contain empty Part objects.',
        );
      });
    });
  });

  describe('validateAiResponse', () => {
    it('accepts response with valid STOP candidate', () => {
      const response = {
        candidates: [{ finishReason: 'STOP', content: { parts: [], role: 'model' } }],
      } as unknown as GenerateContentResponse;

      expect(() => validateAiResponse(response)).not.toThrow();
    });

    it('accepts response when candidate finishReason is undefined', () => {
      const response = {
        candidates: [{ content: { parts: [], role: 'model' } }],
      } as unknown as GenerateContentResponse;

      expect(() => validateAiResponse(response)).not.toThrow();
    });

    it('throws when response has no candidates or empty candidates array', () => {
      expect(() => validateAiResponse({} as GenerateContentResponse)).toThrow(
        'Response candidates are empty or undefined.',
      );
      expect(() => validateAiResponse({ candidates: [] } as unknown as GenerateContentResponse)).toThrow(
        'Response candidates are empty or undefined.',
      );
    });

    it('throws when candidate did not finish with STOP', () => {
      const response = {
        candidates: [{ finishReason: 'SAFETY', content: { parts: [], role: 'model' } }],
      } as unknown as GenerateContentResponse;

      expect(() => validateAiResponse(response)).toThrow('Response generation did not finish normally. Reason: SAFETY');
    });
  });
});
