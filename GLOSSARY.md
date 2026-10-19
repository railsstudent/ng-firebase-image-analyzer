# NgFirebaseImageAnalyzer

Web application for intelligent multimodal image analysis, visual calibration, and tag extraction using hybrid client-side (Gemini Nano via WebGPU) and cloud (Vertex AI) inference.

## Language

**Hybrid Inference**:
The mechanism of routing image analysis queries between client-side WebGPU execution and cloud Vertex AI based on device capabilities and network connectivity.
_Avoid_: Dual inference, fallback inference

**On-Device Pre-Warming**:
The background process of downloading, caching, and compiling WebGPU shaders for the Gemini Nano model during feature initialization to ensure zero-latency first-run inference without delaying initial route loading.
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

**Deferred AI Initialization**:
The architectural pattern of delaying the dynamic import, configuration, and instantiation of Firebase AI and core Firebase SDK modules until an AI-enabled route or action is explicitly requested, keeping the root application bundle completely free of backend SDK code.
_Avoid_: Eager AI bootstrap, root initialization

**Staged Firebase Loading**:
The stepwise asynchronous import sequence where Firebase App, Remote Config, App Check, and Vertex AI Logic dependencies load in independent chunks on demand to eliminate network bottlenecks and prevent race conditions with remote configurations.
_Avoid_: Monolithic Firebase import, sync SDK loading

**Culinary Discovery**:
The Stage 1 generative query retrieving the top 6 iconic dishes and 1–2 honorable mentions for a destination.
_Avoid_: Food search, dish finder, recipe search

**Recipe Synthesis**:
The Stage 2 generative streaming of ingredients and markdown recipe for a selected dish.
_Avoid_: Recipe generation, cook instructions, dish prompt

**Honorable Mention Dishes**:
1–2 runner-up dishes returned during Culinary Discovery.
_Avoid_: Bonus dishes, alternative food, extra recommendations

**Destination Dataset**:
The static curated collection of countries and culinary cities loaded on-demand.
_Avoid_: Country list, city dropdown data, static geo data

**Recipe Accordion**:
The single-expansion disclosure container displaying a culinary dish, responsible for lazy-triggering Stage 2 Recipe Synthesis on expansion and presenting ingredients, instructions, and per-dish token diagnostics.
_Avoid_: Collapsible card, dropdown recipe, food toggle

**Culinary Discovery Panel**:
The dual-tabbed interface presenting Stage 1 Culinary Discovery AI insights, consisting of the AI Reasoning Summary with Honorable Mention Dishes and Modality Tokens analytics.
_Avoid_: Discovery tabs, culinary result panel, food info card.
