# Ticket 05: Slim Down AiService by Delegating to Internal Utilities

**What to build:**
Refactor `AiService` to delegate canvas dummy-image creation and validation assertions to the internal package utilities (`dummy-image.util.ts` and `ai.validation.ts`). Remove 6 private methods (`makeDummyImagePart`, `validateInputs`, `validateContentsArray`, `validateArrayItem`, `validatePartObject`, `validateResponse`) and unneeded constants, dropping `AiService` line count from ~272 to ~175 lines of pure orchestration while keeping its public API contract 100% backward-compatible.

**Blocked by:** Ticket 03 (dummy image utility), Ticket 04 (consolidated AI validation)

**Status:** done

## Scope of Work

1. Update `src/app/core/firebase/ai.service.ts`:
   - Import `createDummyImagePart` from `./dummy-image.util`.
   - Import `validateAiInputs`, `validateAiResponse` from `./ai.validation`.
   - In `preWarmModel`: retain size computation (`options.dummySize || FALLBACK_IMAGE_SIZE`), replace `this.makeDummyImagePart(size)` with `createDummyImagePart(this.#document, size)`, and preserve dimension log (`pre-compiled successfully for shape ${size}x${size}!`).
   - In `generateContentStream`: replace `this.validateInputs(...)` with `validateAiInputs(...)`.
   - In `generateContentStream`: replace `this.validateResponse(...)` with `validateAiResponse(...)`.
   - Delete private helper methods:
     - `makeDummyImagePart`
     - `validateInputs`
     - `validateContentsArray`
     - `validateArrayItem`
     - `validatePartObject`
     - `validateResponse`
   - Retain `FALLBACK_IMAGE_SIZE` import from `./image.const` for size resolution in `preWarmModel`.
2. Verify regressions against existing test suite:
   - Run `npx vitest run src/app/core/firebase/ai.service.spec.ts`
   - Run full project checks:
     - `npx vitest run`
     - `npx ng lint`
     - `npm run check:cycles`
     - `npx knip`
     - `npm run cspell`

## Acceptance Criteria

- [x] `AiService` delegates dummy image generation and validation checks to package-internal utilities.
- [x] WebGPU pre-compilation log preserves dimension diagnostics (`for shape ${size}x${size}!`).
- [x] 6 private micro-functions are removed from `AiService`.
- [x] `AiService` public API surface (`preWarmModel`, `generateContentStream`) remains unchanged and backward-compatible.
- [x] All unit and regression tests in `ai.service.spec.ts` pass cleanly.
