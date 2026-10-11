# 0023. Core Image Analysis Domain Boundary

Date: 2026-10-11
Status: Accepted

## Context

The multimodal image analysis capabilities were previously located within the feature folder (`src/app/features/image-analysis/services/image-analysis.service.ts`), while DOM/Canvas operations (`ImageDownloadService`) and calibration calculations (`VisualCalibrationService`) were co-located in the same directory.

However:

1. `ImageAnalysisService`, its system prompts, and structured JSON schemas constitute the primary domain logic of the application (multimodal AI inference orchestration, on-device pre-warming, streaming transformation).
2. `VisualCalibrationService` and `ImageDownloadService` are presentation and browser/DOM/Canvas rendering concerns (2D canvas context, filter styles, and DOM download anchors).
3. To maintain clean architecture and prevent coupling between headless inference and presentation components, we need a clear domain boundary.

## Decision

1. **Establish Flat Domain Package `src/app/core/image-analysis/`**:
   - Promote `ImageAnalysisService`, `image-analysis.prompt.ts`, `image-analysis.schema.ts`, and domain contracts in `image-analysis.interface.ts` into a cohesive, flat domain package at `src/app/core/image-analysis/`.
   - Expose the public API strictly through `src/app/core/image-analysis/index.ts`.
2. **Retain Presentation Services in `src/app/features/image-analysis/services/`**:
   - `VisualCalibrationService` and `ImageDownloadService` remain inside `src/app/features/image-analysis/services/` as injectable services to keep DOM and canvas rendering concerns out of `core/`.
3. **Encapsulate Domain Interfaces in `core/image-analysis/`**:
   - Define domain interfaces (`ImageAnalysisResponse`, `StreamingAnalysisWithMetadata`, `ColorAdjustment`, `Crop`) directly in `src/app/core/image-analysis/image-analysis.interface.ts`.
4. **Standardize ADR Architecture in `docs/adr/`**:
   - Migrate historical ADRs from `specs/` into `docs/adr/` using the `00xx-<slug>.md` standard naming scheme.

## Consequences

- **Positive**:
  - `ImageAnalysisService` is headless and reusable by any feature or background worker without cross-feature imports.
  - Domain models and services are self-contained within `src/app/core/image-analysis/`.
  - Presentation and canvas rendering pipelines remain clearly separated in `features/`.
- **Negative**:
  - Requires updating import paths across image analysis feature components.
