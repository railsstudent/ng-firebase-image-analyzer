# Architecture Decision Record (ADR)

## Title: Colocated, Feature-Scoped Component for Image Recommendation Skeleton

- **Status**: Accepted
- **Date**: 2026-08-02
- **Authors**: Antigravity & Team

---

## Context

The `ImageRecommendation` component displays a skeleton loader while waiting for recommendations to stream or load. Currently, this skeleton is hardcoded directly inside `image-recommendation.html` as 40 lines of HTML layout using global tailwind and skeleton classes.

To keep the HTML file clean and easy to maintain, we want to extract this skeleton loader into a separate component. However, since this specific skeleton's visual structure (3-row staggered layout with circles and lines) matches only the `ImageRecommendation` content layout, it is highly specific and not currently needed elsewhere in the codebase.

We must decide whether to create a reusable shared component in `src/app/shared/ui/components/` or a private feature-scoped subcomponent in `src/app/features/image-analysis/image-recommendation/`.

---

## Decision

We will extract the skeleton loader into a local, feature-scoped subcomponent named `ImageRecommendationSkeleton` within the `src/app/features/image-analysis/image-recommendation-skeleton/` directory.

### 1. File Colocation

Create the component in `src/app/features/image-analysis/image-recommendation-skeleton/image-recommendation-skeleton.ts` right next to the parent component.

### 2. Angular Standalone Component Pattern

Implement it as a lightweight standalone component with:

- Selector: `app-image-recommendation-skeleton`
- Inline template containing the extracted skeleton HTML markup.
- Local host styling to ensure `display: block`.

### 3. Local Import

Import and declare `ImageRecommendationSkeleton` in `ImageRecommendation`'s `imports` list in `image-recommendation.ts`, delete `image-recommendation.html` and inline template to reference `<app-image-recommendation-skeleton />`.

---

## Considered Options

### Option 1: Shared UI Component in `src/app/shared/ui/components` (Rejected)

- **Why Rejected**: This introduces premature abstraction (YAGNI) and leaks feature-specific design choices (the 3-row staggered layout of recommendations) into a global UI kit that is meant for generic, domain-agnostic components.

### Option 2: Feature-Colocated Component in `src/app/features/...` (Accepted)

- **Why Accepted**: It maximizes cohesion and colocation. If the visual structure of recommendations changes in the future, the corresponding loader and the main view can be modified together in the same directory. It completely adheres to YAGNI and domain-driven design principles.

---

## Consequences

### Pros

- **High Cohesion**: Keeps all template layout, CSS, and structural elements of the recommendation block localized.
- **Clean Architecture**: Protects the generic UI kit from domain-specific component contamination.
- **Zero Overhead**: Simple to refactor or export into a shared component later if a second genuine use-case arises.

### Cons

- **Not Shareable**: If another feature needs this specific skeleton style, they cannot immediately import it without moving it to the shared library. Given that no other recommendations lists exist, this is a negligible risk.
