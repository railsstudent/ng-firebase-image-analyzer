# Documentation Architecture & Document Boundaries

This document defines the separation of roles and scope boundaries across the four core document types.

## Core Document Types

1. **`spec.md` (Product Specification / PRD)**:
   - **Role**: Defines **what** the feature accomplishes and **why** from the user's perspective.
   - **Content**: Problem statement, user stories, product-level behaviors, and **natural-language testing decisions** framed around user journeys, accessibility, and security gates for product managers and non-technical stakeholders.
   - **Scope Boundaries**: Focuses on user-visible behavior; leaves low-level class names, method signatures, private helpers, and library mechanics to the ADR and implementation tickets.

2. **`docs/adr/` (Architectural Decision Records)**:
   - **Role**: Documents **how** the system is built, technology choices, and architectural trade-offs.
   - **Content**: Rationale for technical decisions, evaluation of alternatives, performance and bundle considerations, data storage or persistence strategies, and overarching system patterns.

3. **`DESIGN.md` (Design System & UI Architecture Specification)**:
   - **Role**: Defines the visual language, `@theme` semantic design tokens (synchronized with `src/styles.css`), glassmorphic component patterns, typography scale, and feature UI layout contracts.
   - **Content**: Color/surface tokens, reusable component recipes (e.g. status pills, glassmorphic badges), CLS-safe layout slots, and responsive geometry.
   - **Scope Boundaries**: Must be consulted and reconciled whenever a feature or ticket introduces new UI states, visual badges, layout slots, or theme tokens.

4. **Implementation Tickets (`.scratch/<feature>/issues/NN-<slug>.md` & `.scratch/platform/issues/NN-<slug>.md`)**:
   - **Role**: Human-executable engineering breakdown. Do not assume tickets will be executed by an AI agent—when AI token budgets are low or unavailable, human engineers implement them directly.
   - **Content & Human-Executable Ticket Standard** (overrides generic prose-only templates in `/to-tickets`):
     - Structure the body under `## Acceptance Criteria & Implementation Checklist` with numbered, file-scoped subsections (`### 1. <Task Title> (<exact/file/path>)`).
     - Include exact target `ts`, `html`, `css`, and `.spec.ts` fenced code blocks for every code and unit-test change rather than vague one-line prose descriptions.
     - Reference examples: [06-after-next-render-prewarm-and-cls-safe-status-slot.md](../../.scratch/image-analysis/issues/06-after-next-render-prewarm-and-cls-safe-status-slot.md) and [32-fix-accordion-scroll-trap-and-anchor-expanded-trigger.md](../../.scratch/culinary-guide/issues/32-fix-accordion-scroll-trap-and-anchor-expanded-trigger.md). See also [issue-tracker.md](issue-tracker.md).
   - **Platform & Cross-Domain Issues**: Cross-cutting infrastructure and core platform refactoring tickets belong in `.scratch/platform/issues/` rather than proliferating ad-hoc scratch folders.
   - **Call-Site Blast Radius in Refactoring Tickets**: When authoring refactoring or extraction tickets, never specify the extracted utility in isolation. Always audit existing call sites and include the consumer services/callers that need updating in the ticket's _Scope of Work_ and _Acceptance Criteria_.
   - **Ticket Code-Block Hygiene Gate**: Before finalizing `css`, `html`, and `.spec.ts` code blocks in any ticket, read the full target files and `src/styles.css` to enforce:
     - **Stylesheet & `@utility` Grouping (`>= 2` selectors sharing `>= 3` properties)**: Reuse global `@utility` animations (`animate-fade-in` in `src/styles.css`) instead of redefining `@keyframes`, and group sibling selectors in `.component.css` when `>= 2` selectors share `>= 3` identical surface, backdrop-filter, or `:host-context(.dark)` declarations.
     - **Mutually Exclusive `@if` Slot Symmetry (`0px` height delta)**: When adding or modifying conditional `@if` UI blocks that swap in the same vertical slot (e.g., `!isLoading()` action button vs. `isLoading()` streaming loader), align their wrapper padding and minimum height so toggling states produces `0px` vertical shift in downstream content.
     - **Spec Helper Extraction (`>= 3` occurrences)**: When a ticket's `.spec.ts` code block repeats the same DOM query and spy setup `>= 3` times, extract a pure local helper (`function spy*(fixture: ComponentFixture<T>)`) in the ticket snippet upfront.

## Pre-Flight Just-In-Time (JIT) Ticket Audit Protocol (for AI Assistants)

Batch ticket generation (e.g. via `/to-tickets`) creates speculative downstream tickets that can drift as upstream implementation progresses. Before moving any downstream ticket to `in_progress` or beginning implementation, the AI coding assistant must perform a **Pre-Flight JIT Audit** against the active codebase and upstream changes using four generalized architectural pillars:

1. **Single Source of Truth & Boundary DRY**:
   - Audit domain thresholds, limits, magic literals, and schemas across system layers (prompts, network payloads, validators, error strings).
   - Ensure these boundaries import and reference unified domain constants or configuration types rather than duplicating raw values.

2. **Functional Core, Imperative Shell (Pure Logic Separation)**:
   - Identify deterministic computations (domain validations, parsing, transformations, calculations, filtering).
   - Ensure pure logic is decoupled into standalone, side-effect-free functions (enabling exhaustive zero-mock unit testing), while keeping services and orchestrators focused strictly on I/O coordination, lifecycle, and delivery.

3. **Composite Contracts & Data Cohesion**:
   - Audit method signatures and event payloads for primitive obsession or data clumps (multiple arguments traveling together, e.g. `country: string, city: string`).
   - Group cohesive data into structured domain interfaces (e.g. `CulinaryLocation`) to insulate callers from future contract expansion.

4. **Context-Aware Caller Ergonomics & Failure Semantics ("It Depends")**:
   - **Reactivity Placement**: Keep shared domain services and coordinators free of UI reactivity (e.g. Signals) unless intentionally acting as a shared presentation store; default UI state to consuming components/view-models (Coding Standard § 3).
   - **Delivery Abstraction**: Choose return types intentionally. Stream tokens/events when callers render progressively; aggregate internally and return discrete promises/values when downstream consumers require complete, valid payloads (e.g. markdown parsers, strict JSON decoders per ADR-0029).
   - **Progressive Stream Sanitization**: When streaming partial structured data to UI consumers, apply pure domain normalizers/deduplicators to every yielded chunk—not just terminal payloads—to prevent intermediate render glitches, duplicate track keys, and colliding DOM IDs during active generation.
   - **Resilience & State Preservation**: Explicitly audit cache invalidation and error fallback policies (e.g. preserving cached data on transient network errors vs. eager cache clearing) to prevent disruptive user experiences.
