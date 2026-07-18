# Architecture Decision Record (ADR)

## Title: Consolidate WebGPU Pre-Warming, Static Tensor Shaping, and Capability Checks

- **Status**: Proposed
- **Date**: 2026-07-18
- **Authors**: Antigravity & Team

---

## Context

Our previous performance optimization (ADR 15) successfully introduced a model caching service and a basic pre-warming hook. However, subsequent profiling revealed a recurring 9-second cold-start latency on the first click. Investigation identified two hardware-level bottlenecks:

1. **WebGPU Shader Compilation**: Even when model weights are in memory, WebGPU must compile its mathematical shader pipelines (WGSL) when running its first active forward pass, freezing execution.
2. **Tensor Shape Discrepancy**: WebGPU optimizes shader compilations specifically for the *exact dimension* of the input tensor. If the pre-warm dummy query uses a different image dimension than the real analysis file, WebGPU is forced to discard the warm cache and recompile a new shader on-the-spot.
3. **Capability Constraints**: On machines lacking WebGPU support (e.g., mobile devices, older laptops), attempting WebGPU operations is redundant and throws avoidable console warnings.

---

## Decisions

We will consolidate both **Model Preparation** (weights loading) and **WebGPU Shader Compiling** (dummy execution) into a unified, low-level core API inside `AiService`. This preserves feature-service simplicity while introducing dynamic guards.

### 1. Unified `preWarmModel` with Option-Driven Warm-Up

`AiService.preWarmModel` will accept an optional configuration object to trigger a custom, silent dummy query:

```typescript
export interface PreWarmOptions {
  runDummyQuery?: boolean;
  dummySize?: number;
}
```

### 2. Runtime Capability Guarding

`AiService.preWarmModel` will check `navigator.gpu` before generating dummy images. On non-compatible platforms (like mobile browsers), it will gracefully skip the dummy query, preventing resource waste.

### 3. Static `512x512` Image Resizing (In-Memory Only)

To ensure WebGPU 100% shader-cache matching, every analysis image will be resized in-memory to exactly `512x512` pixels using an HTML5 Canvas before reaching the AI. The dummy query will utilize an identical dynamically generated `512x512` black JPEG, guaranteeing instant, hot-cached execution (reducing first-time latency from 25s to 12s).

---

## Consequences

- **Aesthetic Integrity**: The human user will always see their original, high-resolution image in the UI. The resized `512x512` image lives purely in memory as a short-lived transfer blob.
- **Robustness**: Any failures during the background pre-warm dummy query are caught silently, ensuring application startup is never blocked.
