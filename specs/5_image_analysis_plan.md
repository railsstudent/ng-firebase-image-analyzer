# Specification: Image Analysis AI Feature

This plan outlines the architecture and implementation steps for adding the Image Analysis AI feature utilizing `AiService` in the Angular application.

## 1. Objectives

* Convert user-provided image files/blobs to base64 inline data for multimodal processing.
* Call the Firebase AI service with a schema enforcing a structured response.
* Implement robust input validation (file size, MIME type, prompt checks).
* House utility functions in the `core/utilities` folder.

---

## 2. Architecture & Design

### A. Core Utilities

Two utility files will be added to `src/app/core/utilities/`:

1. **`base64.utils.ts`**: Contains `fileToGenerativePart` to read and convert a `File` or `Blob` into base64 inline data in a format suitable for `firebase/ai`.
2. **`image.utils.ts`**: Contains verification helpers:
   * MIME type validation (must be `image/*`).
   * Size validation (must be under 20MB).

### B. Structured Output Schema

The response from the model must follow a strict JSON schema defined using Firebase AI `Schema` helpers:

```json
{
  "alternativeTexts": ["string"],     // 1 to 3 descriptions
  "tags": [
    { "name": "string", "sentence": "string" }  // min 3 tags
  ],
  "recommendations": ["string"],
  "colorAdjustment": {                 // Optional
    "brightness": "number",
    "saturation": "number",
    "contrast": "number",
    "warmth": "number"
  }
}
```

### C. Image Analysis Service

Located at `src/app/features/image-analysis/services/image-analysis.service.ts`:

* Injects `AiService`.
* Exposes `analyzeImage(file: File | Blob, customPrompt?: string): Promise<ImageAnalysisResponse>`.
* Orchestrates validations, conversion, schema building, and AI invocation.

---

## 3. Implementation Steps

### Step 1: Base64 and Image Validation Utilities

Create the core utility files:

* `src/app/core/utilities/base64.utils.ts`
* `src/app/core/utilities/image.utils.ts`

### Step 2: Define Output Response Schema

Create `src/app/features/image-analysis/schemas/image-analysis.schema.ts` to export the Firebase AI schema.

### Step 3: Implement Image Analysis Service

Create `src/app/features/image-analysis/services/image-analysis.service.ts` to handle input checks, payload composition, and communication with the AI service.

### Step 4: Verification

Build and test the application to ensure clean TypeScript compilation.
