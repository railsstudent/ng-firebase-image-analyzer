# Ticket 02: Consolidate Shared Skeleton Components into Atomic AppSkeleton Primitive

**What to build:** Retire 3 redundant single-use skeleton component folders (12 files), merge shared `@keyframes skeletonPulse` and skeleton styles from `src/app/shared/ui/styles/skeleton.css` directly into `src/app/shared/ui/components/skeleton/skeleton.component.css`, and create an atomic, layout-agnostic `<app-skeleton>` primitive under `src/app/shared/ui/components/skeleton/`. To ensure DRY across both loading seams (the parent `@defer` `@placeholder` in `ImageAnalysisPanelComponent` and child internal `@else` loading states), create a reusable generic 3-row skeleton (`ListSkeletonComponent`) under `src/app/shared/ui/components/skeleton/` shared by both `ImageRecommendationComponent` and `TokenAnalyticsComponent`, and a co-located 2-column image improvement skeleton (`image-improvement-skeleton.component.ts`) in `image-improvement/` composing `<app-skeleton>` with zero custom CSS. Also migrate `ThoughtSummaryComponent` to `<app-list-skeleton>`, allowing `src/app/shared/ui/styles/skeleton.css` to be completely deleted.

**Blocked by:** None (can start immediately)

**Status:** in-progress

## Implementation Specification

### 1. Dedicated Type: `src/app/shared/ui/components/skeleton/skeleton-variant.type.ts`

```typescript
export type SkeletonVariant = 'line' | 'circle' | 'rect';
```

### 2. Standalone Component: `src/app/shared/ui/components/skeleton/skeleton.component.ts`

```typescript
import { Component, computed, input } from '@angular/core';
import { SkeletonVariant } from './skeleton-variant.type';

@Component({
  selector: 'app-skeleton',
  template: `
    @for (itemClass of itemClasses(); track itemClass.id) {
      <div [class]="itemClass.itemClass" aria-hidden="true"></div>
    }
  `,
  styleUrl: './skeleton.component.css',
})
export class SkeletonComponent {
  variant = input<SkeletonVariant>('line');
  lines = input(1);
  class = input('');

  itemClasses = computed(() => {
    const count = Math.max(1, this.lines());
    const isMultiLine = this.variant() === 'line' && count > 1;

    return Array.from({ length: count }, (_, index) => {
      const widthClass = isMultiLine && index === count - 1 ? 'w-3/4' : '';
      const itemClass = `skeleton-primitive skeleton-${this.variant()} ${widthClass} ${this.class()}`.trim();
      return { id: index, itemClass };
    });
  });
}
```

### 3. Component Styles: `src/app/shared/ui/components/skeleton/skeleton.component.css`

```css
@reference "../../../../../styles.css";

@keyframes skeletonPulse {
  0%,
  100% {
    opacity: 1;
    background-color: var(--color-skeleton);
  }
  50% {
    opacity: 0.75;
    background-color: #94a3b8;
  }
}

:host {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-primitive {
  animation: skeletonPulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  background-color: var(--color-skeleton);
}

.skeleton-primitive.skeleton-line {
  @apply h-4 w-full rounded;
}

.skeleton-primitive.skeleton-circle {
  @apply rounded-full aspect-square;
}

.skeleton-primitive.skeleton-rect {
  @apply rounded-lg w-full h-full;
}
```

### 4. Public Barrel: `src/app/shared/ui/components/skeleton/index.ts`

```typescript
export * from './skeleton.component';
export * from './list-skeleton.component';
```

### 5. Skeleton Compositions (Composing `<app-skeleton>`)

To eliminate duplication between `@placeholder` blocks and internal feature loading states (DRY) without resurrecting 12 legacy files and separate CSS:

#### 5.1 Generic 3-Row Skeleton: `src/app/shared/ui/components/skeleton/list-skeleton.component.ts`

Reusable generic 3-row list skeleton shared by both `ImageRecommendationComponent` and `TokenAnalyticsComponent` (and their respective `@placeholder` blocks), composing `<app-skeleton>` with zero custom CSS:

```typescript
import { SkeletonComponent } from './skeleton.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-list-skeleton',
  imports: [SkeletonComponent],
  template: `
    <div class="space-y-4 py-3" aria-hidden="true">
      @for (i of [1, 2, 3]; track i) {
        <div class="flex gap-4">
          <app-skeleton variant="circle" class="h-6 w-6 shrink-0" />
          <div class="flex-1 space-y-2 py-1">
            <app-skeleton variant="line" class="w-1/3" />
            <app-skeleton variant="line" class="w-5/6" />
          </div>
        </div>
      }
    </div>
  `,
})
export class ListSkeletonComponent {}
```

#### 5.2 Co-located Image Improvement Skeleton: `src/app/features/image-analysis/image-improvement/image-improvement-skeleton.component.ts`

Matches legacy 2-column layout (`md:grid-cols-2`: canvas preview `h-48` on left, sidebar with `h-6 w-1/2` header + `w-5/6` and `w-2/3` lines on right):

```typescript
import { SkeletonComponent } from '@/shared/ui/components/skeleton';
import { Component } from '@angular/core';

@Component({
  selector: 'app-image-improvement-skeleton',
  imports: [SkeletonComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 py-4" aria-hidden="true">
      <app-skeleton variant="rect" class="h-48" />
      <div class="space-y-4">
        <app-skeleton variant="line" class="h-6 w-1/2" />
        <app-skeleton variant="line" class="w-5/6" />
        <app-skeleton variant="line" class="w-2/3" />
      </div>
    </div>
  `,
})
export class ImageImprovementSkeletonComponent {}
```

#### 5.3 Consumer Call Sites

1. **Child Feature Components**:
   - `ImageRecommendationComponent`: import `ListSkeletonComponent` from `@/shared/ui/components/skeleton` and render `<app-list-skeleton />` in `@else` block.
   - `TokenAnalyticsComponent`: import `ListSkeletonComponent` from `@/shared/ui/components/skeleton` and render `<app-list-skeleton />` in `@else` block.
   - `ImageImprovementComponent`: import `ImageImprovementSkeletonComponent` from `./image-improvement-skeleton.component` and render `<app-image-improvement-skeleton />` in `@else` block.

2. **Parent `@defer` `@placeholder` in `ImageAnalysisPanelComponent`**:
   - Tab 3.2 (`#recTab`) `@placeholder`: `<app-list-skeleton />`
   - Tab 3.3 (`#tokensTab`) `@placeholder`: `<app-list-skeleton />`
   - Tab 3.4 (`#improveTab`) `@placeholder`: `<app-image-improvement-skeleton />`

#### 5.4 Test Specifications for New & Consuming Components

1. **`ListSkeletonComponent` (`list-skeleton.component.spec.ts`)**:
   - Verify it creates and renders 3 rows of circle and line `<app-skeleton>` primitives.
   - Verify `aria-hidden="true"` is applied to container.

2. **`ImageImprovementSkeletonComponent` (`image-improvement-skeleton.component.spec.ts`)**:
   - Verify it creates and renders 2-column layout with `rect` and `line` primitives.
   - Verify `aria-hidden="true"` is applied to container.

3. **`ImageRecommendationComponent` (`image-recommendation.component.spec.ts`)**:
   - Verify it renders `<app-list-skeleton />` when `recommendations` input is undefined.
   - Verify it renders `<app-recommendation-list>` and items when `recommendations` are populated.

4. **`ImageImprovementComponent` (`image-improvement.component.spec.ts`)**:
   - Verify it renders `<app-image-improvement-skeleton />` in the DOM when `showSkeleton()` is true.
   - Verify it hides `<app-image-improvement-skeleton />` and displays calibration results when inputs are valid.

5. **`TokenAnalyticsComponent` (`token-analytics.component.spec.ts`)**:
   - Verify `<app-list-skeleton />` renders in fallback state when `tokenSummary` is undefined.

---

### 6. Migrate `ThoughtSummaryComponent` & Retire `skeleton.css`

#### `src/app/shared/ui/components/thought-summary/thought-summary.component.ts`

- Import `ListSkeletonComponent` from `@/shared/ui/components/skeleton`.
- Remove `../../styles/skeleton.css` from `styleUrls: ['../../styles/section-card.css', './thought-summary.component.css']`.

#### `src/app/shared/ui/components/thought-summary/thought-summary.component.html`

Replace legacy `.skeleton-line` block:

```html
} @else {
<app-list-skeleton />
}
```

#### `src/app/shared/ui/components/thought-summary/thought-summary.component.spec.ts`

Update unit test cases:

- Verify `<app-list-skeleton>` renders in the DOM when `remarks` input is `undefined`.
- Verify `<app-recommendation-list>` and items render when `remarks` are provided.

#### Delete `src/app/shared/ui/styles/skeleton.css`

Once `ThoughtSummaryComponent` is migrated, delete `src/app/shared/ui/styles/skeleton.css` as all styles are merged into `skeleton.component.css`.

---

## Acceptance Criteria & Checklist

- [x] Create `SkeletonVariant` type in `src/app/shared/ui/components/skeleton/skeleton-variant.type.ts`.
- [x] Create `SkeletonComponent` in `src/app/shared/ui/components/skeleton/skeleton.component.ts` with inline template and signal inputs (`variant`, `lines`, `class`).
- [x] Create component styles in `src/app/shared/ui/components/skeleton/skeleton.component.css` merging `@keyframes skeletonPulse` from `skeleton.css`, `--color-skeleton`, and vertical flex host layout.
- [x] Create public barrel `src/app/shared/ui/components/skeleton/index.ts` exporting `SkeletonComponent` and `SkeletonVariant`.
- [x] Write unit tests in `src/app/shared/ui/components/skeleton/skeleton.component.spec.ts`:
  - Default variant `'line'` renders with `skeleton-line` and `aria-hidden="true"`.
  - Custom variants `'circle'` and `'rect'` apply corresponding CSS classes.
  - Custom classes passed via `class` input/host are merged into computed class list.
  - Multi-line rendering (`[lines]="3"`) renders 3 elements with the final line having `w-3/4`.
- [x] Create generic 3-row skeleton component in `src/app/shared/ui/components/skeleton/list-skeleton.component.ts` and export from skeleton barrel `index.ts`.
- [x] Create co-located image improvement skeleton in `src/app/features/image-analysis/image-improvement/image-improvement-skeleton.component.ts`.
- [x] Update feature components to import and render skeletons:
  - `ImageRecommendationComponent`: import `ListSkeletonComponent` from `@/shared/ui/components/skeleton` and use `<app-list-skeleton />`.
  - `TokenAnalyticsComponent`: import `ListSkeletonComponent` from `@/shared/ui/components/skeleton` and use `<app-list-skeleton />`.
  - `ImageImprovementComponent`: import `ImageImprovementSkeletonComponent` from `./image-improvement-skeleton.component` and use `<app-image-improvement-skeleton />`.
- [x] Update feature component unit tests to assert skeleton DOM rendering:
  - `src/app/features/image-analysis/image-recommendation/image-recommendation.component.spec.ts`: assert `<app-list-skeleton />` fallback and populated list state.
  - `src/app/features/image-analysis/image-improvement/image-improvement.component.spec.ts`: assert `<app-image-improvement-skeleton />` DOM rendering when loading vs calibrated.
  - `src/app/shared/ui/components/token-analytics/token-analytics.component.spec.ts`: assert `<app-list-skeleton />` fallback (already passing).
- [x] Update `ImageAnalysisPanelComponent` (`image-analysis-panel.component.ts` & `image-analysis-panel.component.html`):
  - Import `ListSkeletonComponent` and `ImageImprovementSkeletonComponent`.
  - In Tab 3.2 (`#recTab`), use `<app-list-skeleton />` in `@placeholder`.
  - In Tab 3.3 (`#tokensTab`), use `<app-list-skeleton />` in `@placeholder`.
  - In Tab 3.4 (`#improveTab`), use `<app-image-improvement-skeleton />` in `@placeholder`.
  - Verify `image-analysis-panel.component.spec.ts` passes.
- [x] Migrate `ThoughtSummaryComponent` to `ListSkeletonComponent`, retire `skeleton.css`, and update tests:
  - Import `ListSkeletonComponent` in `thought-summary.component.ts` and remove `../../styles/skeleton.css` from `styleUrls`.
  - Replace fallback markup with `<app-list-skeleton />` in `thought-summary.component.html`.
  - Update unit tests in `thought-summary.component.spec.ts` to assert `<app-list-skeleton>` when `remarks` is undefined and `<app-recommendation-list>` when populated.
  - Delete `src/app/shared/ui/styles/skeleton.css`.
- [x] Delete obsolete legacy skeleton folders (12 files total):
  - `src/app/features/image-analysis/image-recommendation-skeleton/`
  - `src/app/features/image-analysis/image-improvement-skeleton/`
  - `src/app/shared/ui/components/token-analytics-skeleton/`
- [x] Repository invariants:
  - Zero `!`, zero `../` escaping package boundary, native `#` for private state/deps, TypeScript `private` for methods, and no agent git commits.
