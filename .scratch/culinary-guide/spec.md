# Culinary Guide Product Requirements Document (PRD)

## Problem Statement

When exploring food cultures or planning travel, users want to discover authentic local culinary staples for specific destinations and understand how they are prepared. Existing AI prompts often attempt to return exhaustive recipe collections in a single monolithic text block, leading to high streaming latency, model output truncation (especially under client-side hybrid inference constraints like Gemini Nano), and overwhelming walls of text. Furthermore, bundling markdown parsing and HTML sanitization libraries directly into the application's root entrypoint adds unnecessary JavaScript payload (~30 KB) to pages where users never interact with culinary features.

## Solution

A responsive, two-stage **Culinary Guide** architecture optimized for fast hybrid execution on Gemini Nano and Vertex AI:

1. **Destination Selection**: Users select a country to filter available cities, choose a city, and click Search.
2. **Culinary Discovery (Stage 1)**: Submitting a search progressively streams a structured list of iconic local foods and honorable mention runner-up dishes to provide immediate visual feedback on on-device models (Gemini Nano).
3. **Master Analytics Tab Group (Stage 1)**: A dedicated two-tab panel displays Stage 1 model diagnostics:
   - **Tab 1 (Thought Summary)**: Displays the AI thought reasoning chain and the 1–2 honorable mention dishes as remarks.
   - **Tab 2 (Token Usage)**: Displays discovery token analytics for the overall city search.
4. **Recipe Synthesis & Accordion Diagnostics (Stage 2)**: Users explore specific dishes on demand. Expanding an accordion item progressively streams ingredients for immediate feedback, while rendering an animated skeleton for recipe instructions until completion; upon completion, it converts the full markdown recipe into sanitized HTML and displays a per-dish token usage analytics bar at the bottom.
5. **Zero Main-Bundle Overhead**: Markdown parsing and sanitization utilities are dynamically loaded on demand only when a recipe is first formatted.
6. **Session-Scoped Caching**: Completed recipes (including ingredients, formatted HTML, and per-dish token metrics) are cached in-memory, ensuring instant accordion re-expansion without re-triggering AI inference.

## User Stories

1. As a traveler, I want to select a country to filter down the list of cities, pick a city, and press search, so that I can discover representative local foods with progressive streaming without long waiting times on on-device models.
2. As a user, I want the top six foods to be returned as a structured list with native dish names and concise descriptions, so that I can easily scan and compare options.
3. As a user, I want Stage 1 to also return between one and two honorable mention dishes, so that I am always presented with notable runner-up foods that just missed the top six list.
4. As a user, I want a two-tab master analytics group displaying the Thought Summary with honorable mentions in the first tab and Prompt 1 Token Usage in the second tab, so that I can clearly understand the model's high-level discovery reasoning and token cost.
5. As a user, I want search requests to always retrieve fresh AI recommendations, so that repeated searches can surface varied or newly curated culinary suggestions.
6. As a user, I want to view the list of foods initially with collapsed recipe details, so that I am not overwhelmed by massive text blocks.
7. As a user, I want to click on a specific food item to load its ingredients and step-by-step recipe on demand, so that computing resources and network bandwidth are only spent on dishes I care about.
8. As a user, I want expanding an accordion item to progressively stream ingredients immediately and show an animated loading skeleton for the recipe instructions until generation completes, without text flickering from partial markdown parsing.
9. As a user, I want the generated recipe to be cleanly formatted with bold text, lists, and headings, so that it is easy and enjoyable to read.
10. As a user, I want rich text formatting to be safely sanitized against malicious HTML/XSS injection, so that rendering generative AI output remains secure.
11. As a user, I want to see the specific dish's token usage analytics rendered at the bottom of the accordion once generation completes, so that I have clear per-recipe inference transparency.
12. As a user, I want already-loaded recipes (including ingredients, recipe HTML, and per-dish token analytics) to open instantaneously when toggling between accordion items, so that I don't experience redundant loading delays.
13. As a visitor browsing non-culinary pages, I want markdown formatting and sanitization libraries to remain unbundled from the main JavaScript bundle, so that initial page load times and Core Web Vitals remain optimal.
14. As a user in an offline or limited connectivity environment, I want the hybrid inference engine to leverage on-device Gemini Nano when offline and seamlessly route to cloud Vertex AI when online, so that I can discover local culinary dishes regardless of network conditions.
15. As a user, I want initiating a new city search to reset previous accordion states and recipe caches cleanly, so that there is no lingering state from prior searches.

## Implementation Decisions

- **Domain Package Boundaries**:
  - Core domain package established in the core layer (`culinary-guide`), exposing domain contracts, JSON schemas, system prompt builders, and domain communication services.
  - Feature layer package established in the features layer (`culinary-guide`), encapsulating feature state management, Signal stores, dynamic markdown formatting, and in-memory recipe caching.
- **Two-Stage Hybrid Inference Pipeline**:
  - **Stage 1 (Culinary Discovery)**: Constrained by a structured JSON schema returning food items and 1 to 2 honorable mentions. Streams progressively to the UI with retry reset masking to minimize perceived latency on Gemini Nano without card flicker.
  - **Stage 2 (Recipe Synthesis)**: On-demand generation triggered per food item, streaming ingredients progressively and deferring markdown-to-HTML conversion until the recipe stream completes to eliminate partial tag flicker.
- **Two-Tier Analytics Architecture**:
  - **Prompt 1 Master Tab Group**: Tab 1 binds the thought summary and honorable mentions; Tab 2 binds the discovery token summary and modality breakdown.
  - **Prompt 2 Accordion Diagnostics**: Embedded token analytics rendered inside the accordion body beneath the recipe, bound to the active dish's token metrics upon stream completion.
- **Dynamic Bundle Isolation for Markdown**:
  - Encapsulate markdown parsing and HTML sanitization behind a memoized dynamic import promise.
  - Output sanitized HTML directly to standard Angular `[innerHTML]` bindings without injecting Angular's DOM sanitizer.
- **Per-Dish In-Memory Cache**:
  - Stores recipe details, formatted HTML, and per-dish token metrics under composite key `country:city:foodName` in lowercase.
  - Submitting a new search clears the cache and resets active state signals.
- **Generative Model Lifecycle**:
  - Relies on the shared AI model cache service to transparently instantiate and reuse singleton generative model instances keyed by schema and system instructions.

## Testing Decisions

- **What Makes a Good Test**: Tests must verify observable behavior, signal state transitions, and public contract outputs from the consumer perspective rather than asserting private implementation mechanics.
- **Feature State Service Seam**:
  - Verify that submitting a search resets prior state, captures discovery token metrics and 1–2 honorable mentions, and streams 6 food items into the state signal.
  - Verify that requesting a recipe triggers streaming, formats markdown chunks, captures synthesis token analytics, and stores the final result in the in-memory cache.
  - Verify that re-requesting an already-loaded recipe resolves immediately from cache without invoking the underlying AI service.
  - Verify that updating search criteria clears previous cached recipes.
- **Markdown Formatter Seam**:
  - Verify dynamic module resolution, markdown-to-HTML conversion (headers, bullet lists, bold text), and removal of dangerous HTML/XSS vectors (`<script>`, inline handlers).
- **Core Domain Service Seam**:
  - Verify Stage 1 (6 foods + 1-2 honorable mentions) and Stage 2 prompt assembly, schema attachment, and stream generation against the AI backend.
- **Prior Art**: Follow the DI boundary mocking patterns and async generator fixtures established in the image analysis service tests (`satisfies Partial<T>`).

## Out of Scope

- Visual UI component templates, styling, responsive layouts, and accordion animation mechanics (deferred to subsequent UI implementation phase).
- Cross-session persistent storage (IndexedDB, LocalStorage, or Firestore synchronization).
- Custom user dietary filters (e.g., vegan, gluten-free, allergies) and interactive portion scaling.

## Further Notes

- The specification matches the agreed domain terminology (**Culinary Discovery** and **Recipe Synthesis**), the reduced 6-dish + 1–2 honorable mentions constraint for Gemini Nano performance, and the isolated two-tier analytics model.
