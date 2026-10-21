# 0028. Culinary Guide Two-Stage Hybrid Inference, Lazy Markdown Isolation, and Dynamic Destinations

Date: 2026-10-13
Status: Superseded by [ADR-0030](0030-culinary-guide-deferral-boundaries-and-accordion-diagnostics.md)
Relates to: [ADR-0026](0026-deferred-firebase-and-ai-initialization.md), [ADR-0027](0027-in-memory-image-export-and-httpclient-removal.md)

> **Superseded by [ADR-0030](0030-culinary-guide-deferral-boundaries-and-accordion-diagnostics.md)**: Refines the Culinary Guide deferral architecture and Stage 2 per-dish accordion diagnostics layout, establishing 3-tier `@defer` boundaries at the page/tab level and deferred full-width token analytics below the ingredients and recipe grid.

## Context

1. **Text-to-Text Generative AI Demands & Output Constraints**:
   - The application is expanding to provide travel and culinary exploration (querying top iconic local dishes by country and city, followed by major ingredients and step-by-step cooking recipes).
   - Attempting to generate full recipes for all dishes in a single prompt response creates substantial latency, increases token consumption, and risks hitting candidate output limits or token truncation—particularly when running client-side on Gemini Nano via WebGPU.
   - To keep on-device inference fast and responsive, the discovery query must be constrained to a manageable set (6 iconic dishes) while guaranteeing runner-up recommendations (1–2 honorable mentions).

2. **Bundle Size & Markdown Rendering Overhead**:
   - Formatting recipes with bold text, lists, and headings requires a markdown parser (`snarkdown`) and an HTML sanitizer (`dompurify`), contributing ~30 KB of code.
   - If imported statically at the root or within eagerly loaded feature files, this payload would bloat the initial application bundle even for users who never visit the culinary guide.

3. **Destination Data Source & Framework Footprint**:
   - The user interface requires pre-sorted country and city selections to allow users to filter down destinations.
   - [ADR-0027](0027-in-memory-image-export-and-httpclient-removal.md) previously removed `@angular/common/http` to evict ~10–15 KB of HTTP client infrastructure.
   - Re-introducing `HttpClient` solely for a static JSON lookup would regress bundle optimizations.

4. **Two-Tier Model Analytics & In-Memory Caching**:
   - High-level discovery diagnostics (reasoning thoughts, honorable mentions, and Stage 1 token usage) must be visible at the search level.
   - Individual recipe synthesis diagnostics (per-dish token usage) must be attached directly to the expanded accordion item without complicating top-level tabs.
   - Re-opening an accordion item should render immediately without triggering redundant AI model round-trips, while initiating a new search should always retrieve fresh AI recommendations.

## Decision

1. **Two-Stage Hybrid Inference Architecture**:
   - **Stage 1 (Culinary Discovery)**: Accepts `country` and `city` and returns a structured JSON object via `TypedSchema` constraint (`TopFoodsSchema`) returning exactly 6 food items and 1 to 2 honorable mentions. Every user search triggers a fresh query.
   - **Stage 2 (Recipe Synthesis)**: Triggered on-demand when a user expands a specific food item's accordion. Generates a structured JSON object (`{ ingredients: string[], recipe: string }`) where `recipe` contains formatted markdown instructions.

2. **Dynamic Bundle Isolation for Markdown & Destinations**:
   - **Markdown Rendering**: Encapsulate `snarkdown` and `dompurify` inside `MarkdownFormatterService`. Load both libraries asynchronously using a memoized dynamic import promise (`Promise.all([import('snarkdown'), import('dompurify')])`). Output sanitized HTML directly to standard Angular `[innerHTML]` bindings without injecting `DomSanitizer`.
   - **Destinations Dataset**: Store pre-sorted alphabetical countries and clean ASCII city names (top 10 per country, without special characters) in a JSON dataset, loaded on demand via dynamic ESM `import()` (leveraging TypeScript `resolveJsonModule`). This preserves [ADR-0027](0027-in-memory-image-export-and-httpclient-removal.md) with zero `@angular/common/http` footprint.

3. **Two-Tier Diagnostics Presentation**:
   - **Stage 1 (Master Tab Group)**:
     - Tab 1 (`Thought Summary`): Renders `app-thought-summary` binding `[remarks]="honorableMentions"`, `remarksTitle="Honorable Mentions"`, and `[thoughtSummary]="discoveryThoughtSummary"`.
     - Tab 2 (`Token Usage`): Renders `app-token-analytics` binding Stage 1 discovery token usage.
   - **Stage 2 (Per-Dish Accordion Diagnostics)**:
     - Embeds `app-token-analytics` inside the accordion body beneath the recipe, rendering the specific dish's token metrics upon stream finalization.

4. **Session-Scoped In-Memory Cache**:
   - Store generated recipe details and per-dish token metrics in an in-memory `Map<string, CulinaryRecipeDetail>` keyed by `${country}:${city}:${dishName}` in lowercase.
   - Submitting a new search clears the accordion cache and resets active signals.
   - Re-expanding an accordion for an already-loaded dish in the current search immediately renders from the cache.

5. **Generative Model Reuse**:
   - Utilize `AiModelCacheService` to transparently instantiate, configure, and cache separate `GenerativeModel` singletons for Stage 1 (discovery schema) and Stage 2 (recipe synthesis schema).

## Consequences

- **Positive**:
  - The main application entrypoint bundle remains completely untouched by `snarkdown`, `dompurify`, and `@angular/common/http`.
  - Fast first-content response times on Gemini Nano by scoping discovery to 6 dishes and deferring heavy recipe synthesis until explicit user demand.
  - Guaranteed honorable mentions (1–2 dishes) in the Stage 1 thought summary without introducing a third prompt round-trip.
  - Clean diagnostics separation: master-level reasoning in top tabs, per-recipe metrics inside accordions.
  - Instant accordion re-opening via session-scoped memory caching.
- **Negative**:
  - Expanding an un-cached accordion item incurs a brief streaming generation delay for that specific dish.
  - First recipe formatting requires resolving the dynamic ESM chunk for `snarkdown` and `dompurify`.
