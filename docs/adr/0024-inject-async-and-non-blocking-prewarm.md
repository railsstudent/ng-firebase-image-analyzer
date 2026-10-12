# 0024. Lazy Service Injection and Non-Blocking Pre-Warming

Date: 2026-10-12
Status: Accepted

## Context

1. **Bundle Size & Cold Start Performance**:
   - `ImageAnalysisService` imports multimodal AI processing logic and Firebase AI dependencies.
   - Synchronously injecting `ImageAnalysisService` at component construction bundled these modules into the initial JavaScript payload.
   - Initializing on-device Gemini Nano and compiling WebGPU compute pipeline shaders takes ~16 seconds on client hardware.
2. **UI Thread and Lifecycle Blocking**:
   - Triggering model pre-warming in `ngOnInit()` blocked or contended with initial view rendering and prevented immediate interaction with the upload panel.
   - Awaiting pre-warm promises in component handlers prevented event processing and introduced unnecessary latency.
3. **Redundant Hardware Probing Across Layers**:
   - WebGPU support checks (`WINDOW.navigator.gpu`) and logging were duplicated across UI components and core AI infrastructure services.

## Decision

1. **Lazy Service Injection via `injectAsync`**:
   - Use Angular's `injectAsync` in `ImageAnalysisComponent` to dynamically load `ImageAnalysisService` on demand, isolating it into a separate code-split bundle chunk (`chunk-image-analysis-service.js`).
2. **Lifecycle-Decoupled Pre-Warming via Event Trigger**:
   - Eliminate `OnInit` and `ngOnInit()` from `ImageAnalysisComponent`.
   - Introduce `filePickerOpened = output()` on `ImageUploaderComponent` to trigger `preWarm()` in the background immediately when the user clicks or activates the file picker.
   - The natural 10–15 second window while the user navigates the native OS file picker is utilized to compile WebGPU compute shaders in the background.
3. **Non-Blocking Promise Pre-Warming**:
   - Structure `preWarm()` in `ImageAnalysisComponent` using asynchronous background promise execution (`.then().catch()`) so that UI event handlers remain non-blocking.
   - Memoize the pre-warm sequence in `ImageAnalysisService` via `#preWarmPromise` to guarantee idempotent, exactly-once execution.
4. **Single Source of Truth for WebGPU Capabilities**:
   - Centralize `#isWebGPUSupported` inside `AiService` at the infrastructure boundary.
   - Remove redundant `WINDOW` and GPU capability checks from `ImageAnalysisComponent`.
5. **Unified File State Output**:
   - Standardize `fileSelected = output<File | null>()` in `ImageUploaderComponent` to handle both file selection and image removal with deduplicated state reset logic in parent components.

## Consequences

- **Positive**:
  - Initial JS bundle size is reduced through code splitting.
  - Perceived cold start latency is reduced by >50% (absorbing the 16s WebGPU compilation during file selection).
  - Component code is purely event-driven with zero Angular lifecycle hook bloat.
  - Idempotent memoization ensures multiple triggers (file picker open, drop fallback) never create conflicting GPU compilation queries.
- **Negative**:
  - Pre-warming starts upon user interaction (file picker open / drop) rather than at initial page load.
