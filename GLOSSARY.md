# NgFirebaseImageAnalyzer

Web application for intelligent multimodal image analysis, visual calibration, and tag extraction using hybrid client-side (Gemini Nano via WebGPU) and cloud (Vertex AI) inference.

## Language

**Hybrid Inference**:
The mechanism of routing image analysis queries between client-side WebGPU execution and cloud Vertex AI based on device capabilities and network connectivity.
_Avoid_: Dual inference, fallback inference

**On-Device Pre-Warming**:
The background process of downloading, caching, and compiling WebGPU shaders for the Gemini Nano model during image selection to ensure zero-latency first-run inference without delaying initial route loading.
_Avoid_: Lazy caching, background downloading

**App Check Sandbox**:
A local development mechanism that bypasses reCAPTCHA Enterprise verification, operating in Transient Mode (ephemeral single-session debug tokens) or Locked Mode (persistent registered debug tokens).
_Avoid_: Token bypass, mock auth

**Visual Calibration**:
The process and controls for calibrating image properties (brightness, saturation, contrast, and warmth) and crop regions based on structural metadata returned by the analysis models.
_Avoid_: Photo filter, image editing, post-processing

**Modality Tokens**:
The token breakdown categorizing input and output cost metrics across text, image, and thinking modalities during model inference across features.
_Avoid_: Token counter, inference cost

**AI Reasoning Summary**:
The structured overview presenting generative model thought chains, source attribution, and contextual remarks across AI features.
_Avoid_: Model log, raw output, explanation box
