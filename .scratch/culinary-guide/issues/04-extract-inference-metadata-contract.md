# Ticket 04: Extract Shared AI Inference Metadata Contract

**Blocked by:** None (can start immediately)

**Status:** done

## Context & Purpose

Unify the streaming response metadata shape (`source`, `thoughtSummary`, `tokenSummary`, `tokenModalityBreakdown`) into a reusable domain contract `InferenceMetadata` under `src/app/core/firebase/`. This avoids redundant field definitions across image analysis, culinary discovery (Stage 1), and recipe synthesis (Stage 2).

## Scope of Work

1. Create `src/app/core/firebase/inference-metadata.interface.ts`:
   - Import `InferenceSource` from `firebase/ai`.
   - Import `TokenModalityBreakdown` and `TokenSummary` from `./token-usage.interface`.
   - Export `InferenceMetadata`:

     ```typescript
     export interface InferenceMetadata {
       source?: InferenceSource;
       thoughtSummary?: string;
       tokenSummary?: TokenSummary;
       tokenModalityBreakdown?: TokenModalityBreakdown;
     }
     ```

2. Re-export `InferenceMetadata` in `src/app/core/firebase/index.ts`:
   - `export type { InferenceMetadata } from './inference-metadata.interface';`
3. Refactor `ImageAnalysisWithMetadata` in `src/app/core/image-analysis/image-analysis.interface.ts` to extend `InferenceMetadata`.

## Acceptance Criteria

- [x] Create `src/app/core/firebase/inference-metadata.interface.ts` conforming to the flat domain package structure.
- [x] Export `InferenceMetadata` interface with optional `source`, `thoughtSummary`, `tokenSummary`, and `tokenModalityBreakdown`.
- [x] Export `InferenceMetadata` from `src/app/core/firebase/index.ts`.
- [x] Conforms to coding standards (zero `../`, type-only imports, flat domain structure).
