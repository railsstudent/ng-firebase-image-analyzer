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
2. **Lifecycle-Decoupled Pre-Warming via `afterNextRender`**:
   - Eliminate `OnInit` and `ngOnInit()` from `ImageAnalysisComponent`, and retire the `(filePickerOpened)` output from `ImageUploaderComponent` as well as redundant `preWarm()` triggers in `onFileSelected()`.
   - Trigger `this.preWarm()` automatically once inside `ImageAnalysisComponent`'s `constructor()` via `afterNextRender({ write: async () => { await this.preWarm(); } })` so WebGPU shader compilation starts immediately after the initial browser paint without blocking first render.
   - Remove `#preWarmPromise` memoization from `ImageAnalysisService.preWarm()` in favor of single-execution `afterNextRender` orchestration at the component boundary.
3. **Non-Blocking Pre-Warm Status & 0-CLS Layout Slot**:
   - Track pre-warming progress via a component-local `warmingMessage = signal<string>('')` inside `ImageAnalysisComponent`, setting `'Pre-warming on-device AI model...'` after awaiting `this.#asyncImageAnalysisService()` (yielding past `afterNextRender`'s synchronous `_tick()` window so Zoneless change detection schedules a view refresh) and before awaiting `imageAnalysisService.preWarm()`, then clearing it to `''` inside `finally`.
   - Render a dedicated `.prewarm-status-slot` (`min-h-9 my-0`, paired with `.workspace-container > app-image-uploader { @apply mb-0; }`, `role="status"`, `aria-live="polite"`) directly below `<app-image-uploader>` to display `.prewarm-status-badge` while preserving a 0.000 Cumulative Layout Shift (CLS) and keeping upload and analysis controls 100% enabled.
4. **Single Source of Truth for WebGPU Capabilities**:
   - Centralize `#isWebGPUSupported` inside `AiService` at the infrastructure boundary.
   - Remove redundant `WINDOW` and GPU capability checks from `ImageAnalysisComponent`.
5. **Unified File State Output**:
   - Standardize `fileSelected = output<File | null>()` in `ImageUploaderComponent` to handle both file selection and image removal with deduplicated state reset logic in parent components.

## Consequences

- **Positive**:
  - Initial JS bundle size is reduced through code splitting.
  - Pre-warming begins immediately after initial component render (`afterNextRender`), maximizing head start before the user selects an image and clicks "Analyze Image".
  - Dedicated `min-h-9` `.prewarm-status-slot` provides accessible live status feedback (`role="status"`, `aria-live="polite"`) with 0.000 CLS while keeping the uploader and "Analyze Image" action unblocked.
  - Single-execution `afterNextRender` orchestration eliminates `#preWarmPromise` state from `ImageAnalysisService` and removes pre-warming coupling from `ImageUploaderComponent`.
- **Negative**:
  - If a user uploads an image and clicks "Analyze Image" within the first few seconds before WebGPU shader compilation finishes, the analysis stream awaits or falls back dynamically.
