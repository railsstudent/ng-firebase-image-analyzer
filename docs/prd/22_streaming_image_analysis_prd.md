# Product Requirement Document (PRD)

## Title: Progressive Real-Time Streaming Image Analysis

- **Status**: Proposed
- **Date**: 2026-07-27
- **PRD Number**: 22

---

## Problem Statement

The application utilizes hybrid generative AI models (Gemini Nano on-device and Vertex AI in-cloud) via the Firebase AI Logic SDK. While on-device caching and model pre-warming are fully functional, a full structured image analysis inference takes approximately **12 seconds** to complete.

Currently, the user is presented with a blocking full-screen loading spinner. Staring at this static loading indicator for 12 seconds with zero progressive visual feedback leads to a poor perceived performance, high user anxiety, and a feeling that the application has frozen.

---

## Solution

We will completely overhaul the user experience by replacing the blocking synchronous pipeline with a progressive, real-time **Async Generator Streaming Response**.

As raw JSON tokens stream from the model, we will use a fault-tolerant JSON repair engine to balance brackets and quotes on-the-fly, allowing us to parse and render incomplete data in real-time.

Instead of a full-screen loading spinner, we will display a sleek, glassmorphic status loader badge styled with **TailwindCSS v4** and a ticking performance timer. This lets the user see alternative text, tags, and recommendations progressively stream onto the canvas starting within **1 second** of trigger, dramatically lowering the perceived latency.

---

## User Stories

1. As an application user, I want the image analysis results to start appearing on my screen progressively as they are generated, so that I don't have to wait 12 seconds in total silence.
2. As an application user, I want to see a running timer ticking up in real-time when an analysis starts, so that I am assured the system is actively processing my image.
3. As an application user, I want to see a premium, non-blocking status badge indicating "Streaming AI Insights..." during active generation, so that the underlying workspace remains fully visible and engaging.
4. As an application user, I want to see the "Detected Classifications" tag cloud populate instantly as soon as individual tags are received, so that I can begin reviewing classifications immediately.
5. As an application user, I want to see pulsing skeleton loaders over sections (like "Recommendations" or "Improvement Adjustments") that are still waiting to be generated, so that I understand where content will appear once the stream progresses.
6. As an application user, I want the alternative text card to render and type itself out in real-time, so that I receive immediate descriptive accessibility feedback.
7. As an application user, I want a smooth transition fade-and-rise effect as new sections of the analysis reveal themselves, so that the streaming visual rhythm feels exceptionally fluid and cohesive.
8. As a developer, I want to access partial streaming results using safe TypeScript interfaces, so that I am compile-time protected against null-pointer crashes while properties are still materializing.
9. As a developer, I want streaming JSON chunks to be repaired safely under the hood, so that malformed or truncated AI output strings do not crash the frontend parser.

---

## Implementation Decisions

### 1. Fault-Tolerant JSON Repair Engine

To parse incoming, incomplete structured JSON stream chunks safely, we will integrate Jos de Jong's zero-dependency `jsonrepair` package from npm. This package will run inside our stream loop to heal unclosed brackets, braces, quotes, and keys before parsing.

### 2. Async Generator Stream Core

We will refactor our AI integration layers to leverage ES6 Async Generators (`async *` / `yield`). The stream wrapper will:

- Capture raw stream tokens.
- Run them through the `jsonrepair` engine and parse the partial result.
- `yield` the parsed partial object.
- On stream completion, resolve the final promise wrapper to attach and emit official token usage metadata.

### 3. Progressive UI Layout & TailwindCSS v4 Styling

We will remove the destructive full-page spinner check (`@if (isLoading)`) from the parent template to allow progressive layouts to render:

- The loader will be implemented using a sleek `.streaming-loader-badge` container.
- We will use **TailwindCSS v4 utility classes** (like `flex`, `items-center`, `gap-sm`, and v4 opacity modifiers `/30`) combined with the global Tailwind `@theme` configuration to implement a glassmorphic look (`12px` backdrop blur, low-contrast outline border, radial soft shadows).
- All progressive cards and sections will animate smoothly using an `.animate-fade-in` utility (fade-and-rise keyframes transition).

### 4. Safe State Types (The Partial Schema Contract)

To protect the client from runtime crashes while keys are missing, the streaming state will be typed as a `Partial<T>` representation of the schema.
TypeScript optional chaining and Angular conditional blocks (`@if (analysis.property)`) will be used to safely transition sections from skeleton states to populated states.

---

## Testing Decisions

### 1. Seam-Based Integration Testing

We will test the streaming pipeline at the **Image Analysis Service** level (our primary test seam). We will mock the underlying Firebase AI Logic SDK `generateContentStream` to emit a sequence of raw JSON string fragments (e.g., chunk 1: `{"alternativeTexts": ["A"`, chunk 2: `"sunset"]}`).

### 2. Behavioral Verification Expectations

Our tests will verify that:

- The streaming pipeline does not crash during incomplete chunk parses.
- The service correctly yields a progressive sequence of parsed, repaired partial objects matching the expected stages.
- Empty arrays are **not** pre-populated during stream iterations, ensuring that missing properties remain `undefined` so that UI skeletons render correctly (behavior-only verification).
- On final completion, the yielded state contains the full payload as well as correct token usage counts.

### 3. Prior Art

The test suite will follow the Vitest integration suite pattern used for previous service and model warming tests.

---

## Out of Scope

- **Real-Time Interactive Cropping**: Drawing bounding box overlays on the canvas progressively while the crop coordinates are still streaming. Bounding boxes will render as a single animated entrance only once their full numeric coordinates have arrived.
- **Custom Streaming Speed Controls**: Letting users adjust the speed or delay of incoming chunks.
- **Offline Progressive Support**: Skeletons and streaming in completely offline mode if model caches are entirely cold (the app will fall back to a standard offline warning page).

---

## Further Notes

### Brand and Theme Harmonization

All styling variables (primary, primary-container, outline, surface-container) correspond to the Material 3 mapping defined in the Tailwind CSS v4 `@theme` configuration within `src/styles.css`. This ensures that the glassmorphism aesthetic blends seamlessly with both light and dark layouts.
