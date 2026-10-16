# Ticket 04: Extract Consolidated AI Validation Utility

**What to build:**
Extract and consolidate the fragmented validation functions from `AiService` into an internal, standalone platform validation utility (`ai.validation.ts`). Merges 4 fragmented input checks into a single cohesive `validateAiInputs(contents: unknown): void` function using a mutually exclusive `if / else if / else` assertion chain with zero `return` statements, and extracts `validateAiResponse(response: GenerateContentResponse): void` for validating candidates and finish reasons.

**Blocked by:** None (can start immediately)

**Status:** done

## Scope of Work

1. Create `src/app/core/firebase/ai.validation.ts`:
   - Implement `validateAiInputs(contents: unknown): void`:
     - Checks `null` or `undefined` -> throws `'Input contents cannot be null or undefined.'`.
     - `if (typeof contents === 'string')`: checks empty or whitespace -> throws `'Input string contents cannot be empty or whitespace.'`.
     - `else if (Array.isArray(contents))`: checks empty array (`'Input contents array cannot be empty.'`), loops elements throwing on `null`/`undefined`, empty string, or empty Part object.
     - `else if (typeof contents === 'object')`: checks `Object.keys(contents).length === 0` -> throws `'Input Part object cannot be empty.'`.
     - `else`: throws `'Invalid input contents type.'`.
     - Employs zero explicit `return` statements.
   - Implement `validateAiResponse(response: GenerateContentResponse): void`:
     - Checks candidates existence and non-empty length.
     - Checks first candidate's `finishReason` is `'STOP'`.
   - Export strictly within the internal package; do NOT export in `src/app/core/firebase/index.ts`.
2. Create `src/app/core/firebase/ai.validation.spec.ts`:
   - Comprehensive parameterized tests for `validateAiInputs`:
     - Valid inputs: valid string, non-empty Part object, valid array of strings/Parts.
     - Error branches: null/undefined, whitespace string, empty array, array with null/empty items, empty Part, invalid types (number, boolean, function).
   - Parameterized tests for `validateAiResponse`:
     - Valid STOP response passes.
     - Empty or missing candidates throw.
     - Non-STOP finish reasons (`SAFETY`, `MAX_TOKENS`) throw with detailed message.
3. Verify with:
   - `npx vitest run src/app/core/firebase/ai.validation.spec.ts`
   - `npx ng lint`
   - `npm run check:cycles`
   - `npm run cspell`

## Acceptance Criteria

- [x] `validateAiInputs` merges all input assertions without micro-function fragmentation and with zero `return` statements.
- [x] `validateAiResponse` validates candidate list and normal completion finish reasons.
- [x] 100% preservation of error messages and guard semantics.
- [x] Internal utility is not exposed via `src/app/core/firebase/index.ts`.
- [x] Comprehensive unit tests pass.
