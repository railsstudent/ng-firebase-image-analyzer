# Specification: Progressive Real-Time Streaming Image Analysis

## Problem Statement

While on-device pre-warming and model caching are fully operational, running structured, multi-dimensional image analysis queries takes approximately **12 seconds** to complete. Stating at a static, full-screen loading spinner for 12 seconds with zero progressive visual feedback leads to high user anxiety, a poor perceived performance, and an impression that the application has frozen.

To lower perceived latency and keep the user engaged, the application needs a progressive, real-time feedback mechanism that streams results onto the screen as they are generated.

---

## Solution

We will replace the blocking synchronous pipeline with a progressive, real-time **Async Generator Streaming Response** powered by ES6 Async Generators (`async *` / `yield`).

As raw JSON tokens stream progressively from the model, we will use a fault-tolerant JSON repair engine (`jsonrepair`) on-the-fly to close open brackets and quotes. This allows us to parse and render incomplete data in real-time, populating alternative text, tag clouds, and suggestions starting within **1 second** of trigger. In parallel, a non-blocking glassmorphic status loader badge with a ticking performance timer will replace the heavy full-screen blocking spinner, keeping the underlying workspace fully visible.

---

## User Stories

1. **As an application user,** I want image analysis results to appear on my screen progressively as they are generated, so that I do not have to wait 12 seconds in silence.
2. **As an application user,** I want to see a ticking performance timer when an analysis begins, so that I am assured the system is actively processing my request.
3. **As an application user,** I want a sleek, non-blocking status badge indicating "Streaming AI Insights...", so that the workspace remains fully visible and engaging.
4. **As an application user,** I want the classification tag cloud to populate instantly as individual tags are received, so that I can begin reviewing classifications immediately.
5. **As an application user,** I want to see pulsing skeleton placeholders over areas that are still waiting to be generated, so that I understand where content will eventually appear.
6. **As a developer,** I want to access partial streaming results using safe TypeScript interfaces, protecting the client from runtime crashes while keys are still materializing.

---

## High-Level Implementation Decisions

* **Real-time JSON Repair:** Integrate a zero-dependency JSON repair engine to heal unclosed brackets, braces, and keys, preventing parser failures during active streams.
* **Partial State Interfaces (`Partial<T>`):** Type the progressive streaming state using optional properties, combining Angular's conditional blocks (`@if`) to transition sections from skeleton states to populated states smoothly.
* **Glassmorphic Status Badge:** Implement a non-destructive `.streaming-loader-badge` using Tailwind CSS v4 styling rules, incorporating radial soft shadows and backdrop blurs to blend with both light and dark themes.

---

## Out of Scope

* Rendering bounding box overlays progressively while coordinates are still streaming (bounding boxes will draw as a single animation only once full numeric coordinates arrive).
* Providing custom streaming speed or delay adjustment controls in the UI.
* Progressive streaming support when the user is completely offline and model caches are entirely cold.
