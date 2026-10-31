# 0010. Shared Recommendation Components

Date: 2026-07-10
Status: Accepted

This document outlines the design, rationale, and implementation steps to resolve style and HTML template duplication between `ThoughtSummary` and `ImageRecommendation` components by introducing reusable, presentation-focused UI components with native host-role styling.

---

## 1. Context & Problem Statement

Both `ThoughtSummary` and `ImageRecommendation` display structured recommendation lists with identical layout needs (such as borders, vertical padding, font weights, and spacing).

Currently, the styling rules for:

- `.recommendations-list` (container dividers)
- `.recommendation-item` (item borders and padding)
- `.recommendation-title` (header styles and text weights)
- `.recommendation-reason` (muted description styling)

are duplicated across [thought-summary.css](../../src/app/features/image-analysis/thought-summary/thought-summary.css) and [image-recommendation.css](../../src/app/features/image-analysis/image-recommendation/image-recommendation.css).

Furthermore, while the layout is highly similar, their inline DOM trees have key differences:

1. `ImageRecommendation` requires an indicator dot preceding the item-level title.
2. `ThoughtSummary` requires an index number preceding the item-level title.
3. `ThoughtSummary` contains a list-level header ("Alternative Texts") above the entire list, which shares styling with the individual items' titles.

We need a solution that establishes a single source of truth for these styles without breaking component encapsulation, sacrificing design flexibility, or bypassing ESLint static analysis guardrails.

---

## 2. Proposed Decision

We will introduce a **two-component presentational pattern** using standard Angular elements (`app-recommendation-list` and `app-recommendation-item`) combined with host element role binding and display mapping:

1. **`RecommendationList`**: Custom element `<app-recommendation-list>` configured with `role="list"` and `:host { display: block }` to behave exactly like a semantic `<ul>` element.
2. **`RecommendationItem`**: Custom element `<app-recommendation-item>` configured with `role="listitem"` and `:host { display: block }` to behave exactly like a semantic `<li>` element.

By utilizing standard element selectors, we fully comply with `@angular-eslint/component-selector` rules (no `eslint-disable` overrides needed). By utilizing host-level `display: block` styling, we ensure that Tailwind direct-child operations (like `divide-y`) render vertical borders **perfectly** across the list custom tags.

---

## 3. Detailed Component Specification

The new components will be located in the shared UI library:

### A. List Wrapper Component

- **Directory:** `src/app/shared/ui/components/recommendation-list`
- **Template File:** `recommendation-list.component.ts` (Inline template)
- **Stylesheet:** `recommendation-list.component.css`

```typescript
// recommendation-list.component.ts
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-recommendation-list',
  template: `
    @if (listTitle()) {
      <p class="recommendation-list-title font-bold mb-2">{{ listTitle() }}</p>
    }
    <ng-content />
  `,
  host: {
    role: 'list',
    class: 'recommendations-list block',
  },
  styleUrl: './recommendation-list.component.css',
})
export class RecommendationListComponent {
  listTitle = input<string | null>(null);
}
```

```css
/* recommendation-list.component.css */
@reference "../../../../../styles.css";

.recommendation-list-title {
  @apply flex items-center gap-2;
}
```

---

### B. List Item Component

- **Directory:** `src/app/shared/ui/components/recommendation-list`
- **Template File:** `recommendation-item.component.html`
- **Stylesheet:** `recommendation-item.component.css`

```typescript
// recommendation-item.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-recommendation-item',
  templateUrl: './recommendation-item.component.html',
  host: {
    role: 'listitem',
    class: 'py-4 border-t border-outline-variant/20 first:border-t-0 block',
  },
  styleUrl: './recommendation-item.component.css',
})
export class RecommendationItemComponent {}
```

```html
<!-- recommendation-item.component.html -->
<p class="recommendation-item-title font-bold gap-2">
  <ng-content select="[indicator]"></ng-content>
  <ng-content select="[title]"></ng-content>
</p>

<p class="recommendation-item-reason text-sm text-on-surface-variant">
  <ng-content></ng-content>
</p>
```

```css
/* recommendation-item.component.css */
@reference "../../../../../styles.css";

.recommendation-item-title {
  @apply flex items-center;
}

.recommendation-item-reason {
  @apply mt-1 ml-3.5;
}
```

---

## 4. Feature Refactoring Plan

Once approved, the refactoring will execute as follows:

### Step 1: Create Shared Components

Generate and populate the stylesheets and standalone components as specified above under `src/app/shared/ui/components/`.

### Step 2: Update Image Recommendation

Refactor `image-recommendation.ts` to import `RecommendationList` and `RecommendationItem`. Update the HTML structure:

```html
<app-recommendation-list>
  @for (rec of recommendations(); track rec.recommendation) {
  <app-recommendation-item>
    <span indicator class="recommendation-indicator"></span>
    <span title>{{ rec.recommendation }}</span>
    {{ rec.sentence }}
  </app-recommendation-item>
  }
</app-recommendation-list>
```

_Clean Up:_ Delete the duplicated classes in `image-recommendation.css`, keeping only `.recommendation-indicator` as it is uniquely required for this component.

### Step 3: Update Thought Summary

Refactor `thought-summary.ts` to import `RecommendationList` and `RecommendationItem`. Update the HTML structure:

```html
<app-recommendation-list listTitle="Alternative Texts">
  @for (alt of alternativeTexts(); track alt; let i = $index) {
  <app-recommendation-item>
    <span title>{{ i + 1 }}. Alternative Suggestion</span>
    {{ alt }}
  </app-recommendation-item>
  }
</app-recommendation-list>
```

_Clean Up:_ Delete all duplicated styles from `thought-summary.css`, keeping only the local card overview typography.

---

## 5. Alternatives Considered

1. **Move to Global Stylesheets (Option A):** Abandoned because exposing component-specific list formatting to the global scope violates Angular's strict encapsulation model and could lead to stylesheet pollution.
2. **Tailwind Utility Inlining (Option B):** Abandoned because it makes the templates verbose and harder to manage if minor design properties (like paddings or margins) need to be tweaked systematically down the line.
3. **Target-Tag Attribute Selectors (Option C):** Abandoned because prepending native tags (such as `li[app-recommendation-item]`) triggers lint warnings under ESLint rule `@angular-eslint/component-selector`, and bypassing checks with `eslint-disable` is not considered a clean engineering practice.

---

## 6. Addendum: Compound Package Colocation & Unified Barrel Export

### Context & Architectural Alignment

Following the compound component package standard defined in [component-context-pattern.md](../architecture/component-context-pattern.md), compound UI primitives that share complementary semantic roles (`role="list"` and `role="listitem"`) and are consumed together should reside in a single flat directory with a unified public barrel export.

### Amended Package Structure

Consolidate `RecommendationItemComponent` from `src/app/shared/ui/components/recommendation-item/` into `src/app/shared/ui/components/recommendation-list/`:

```text
src/app/shared/ui/components/recommendation-list/
├── index.ts
├── recommendation-item.component.css
├── recommendation-item.component.html
├── recommendation-item.component.spec.ts
├── recommendation-item.component.ts
├── recommendation-list.component.css
├── recommendation-list.component.spec.ts
└── recommendation-list.component.ts
```

### Public Barrel (`index.ts`)

Expose both `RecommendationListComponent` and `RecommendationItemComponent` from `@/shared/ui/components/recommendation-list`:

```typescript
export * from './recommendation-item.component';
export * from './recommendation-list.component';
```
