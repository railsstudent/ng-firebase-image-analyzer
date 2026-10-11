# Architecture Decision Record (ADR)

## Title: Real-Time Streaming Image Analysis via Async Generators and `jsonrepair`

- **Status**: Proposed
- **Date**: 2026-07-26
- **Authors**: Antigravity & Team

---

## Context

The application utilizes the **Firebase AI Logic Web SDK** to support hybrid on-device (Gemini Nano) and in-cloud (Vertex AI) generative AI capabilities. During performance profiling, image analysis inference was observed to take approximately **12 seconds** to complete.

While on-device pre-warming and model caching are fully implemented, the user is still forced to stare at a blocking full-screen loading spinner for 12 seconds while waiting for the final, structured JSON payload matching `ImageAnalysisSchema` to be fully generated.

To break this latency barrier, we must implement **Streaming Responses**. However, streaming structured JSON presents a unique technical hurdle: the stream contains incomplete JSON fragments (e.g., `{"alternativeTexts": ["A sunset",`) that will crash a standard `JSON.parse()` call with syntax errors.

---

## Decision

We will transition the entire image analysis pipeline from synchronous blocking calls to a progressive **Async Generator Streaming Pipeline** using Jos de Jong's zero-dependency `jsonrepair` package.

### 1. Integrate `jsonrepair` on npm

We will install the industry-standard `jsonrepair` library. On every streaming chunk arrival, we will run the accumulated raw text through `jsonrepair` to balance unclosed strings, quotes, brackets, and braces, and strip trailing commas/incomplete keys before parsing.

### 2. Refactor `AiService.generateContentStream` to an Async Generator

We will rewrite `generateContentStream` in `AiService` to return an `AsyncGenerator`:

- It will yield progressively-repaired, parsed partial JavaScript objects on every chunk.
- On stream completion, it will await the final response promise to process and append token usage statistics.

### 3. Implement Strict TypeScript Compile-Time Safety (`Partial<T>`)

Because fields arrive sequentially (e.g., `alternativeTexts` $\rightarrow$ `tags` $\rightarrow$ `recommendations` $\rightarrow$ `crop` / `colorAdjustment`), we will define a relaxed mapping type for the streaming state:

```typescript
export type StreamingAnalysisWithMetadata = Omit<ImageAnalysisWithMetadata, 'analysis'> & {
  analysis: Partial<ImageAnalysisResponse>;
};
```

Casting intermediate chunks as `Partial<ImageAnalysisResponse>` enforces strict compiler checks. It prevents runtime null-pointer exceptions and ensures development safety when accessing fields before they materialize in the stream.

### 4. Overhaul the Loading Layout to Progressive Rendering & Update `Design.md`

We will eliminate the full-screen loading spinner from `image-analysis.html` entirely.

- The classifications (`app-tag-list`) and analysis panel (`app-image-analysis-panel`) will render instantly once their signals have initial partial keys.
- A minimalist, glassmorphic `.streaming-loader-badge` accompanied by a pulsing spin indicator will display the live performance timer ticking up in real-time until completion.
- **`Design.md` Synchronizations:** We will officially update `Design.md` to establish the semantic tokens, backdrop filter formulas, border styling, and animation frames for this new **Progressive Stream Loading** component state. This ensures that the codebase design system documents remain 100% cohesive with our implementation.

---

## Considered Options

### Option 1: Custom Regex / Bracket Counting (Rejected)

We considered writing a simple local regex and character counting utility to repair the JSON. While lightweight, it is highly fragile, struggles to handle complex nested objects or escaped characters, and adds custom maintenance overhead.

### Option 2: Regex-Only Extraction (Rejected)

We considered bypass-parsing JSON entirely and extracting only the alt text and tags using regex. This is extremely fast but fails to support downstream visual enhancements like image crops and color adjustments which require fully-formed numeric key structures.

### Option 3: Jos de Jong's `jsonrepair` Library (Accepted)

An incredibly robust, zero-dependency, battle-tested library designed specifically to repair malformed or streaming AI outputs. Installing it completely avoids custom engine maintenance and handles all streaming JSON edge cases flawlessly.

---

## Consequences

### Pros

- **Superb User Perception:** Perceived latency drops from 12 seconds to **under 1 second** as alternative texts begin typing themselves out on-screen instantly.

- **Flawless Type Safety:** By using `Partial<T>`, the compiler prevents developers from accidentally referencing fields that have not yet streamed onto the client.
- **Low Code Overhead:** Offloading JSON repair to `jsonrepair` keeps our service code extremely clean, concise, and focused on framework orchestration.
- **Dual Compatibility:** Because a complete object (`T`) is always assignable to its partial (`Partial<T>`), our cloud-fallback logic seamlessly integrates with the exact same signals.

### Cons

- **Downstream Input Adjustments:** Child components (like `ImageImprovement`) must relax their input types to support `Partial` structures, and template bindings must specify empty-array fallback values (e.g., `analysis.tags || []`) to remain compile-safe.
