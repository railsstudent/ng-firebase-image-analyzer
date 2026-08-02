# Specification: Colocated Image Recommendation Skeleton Component

This plan outlines the implementation steps to extract the inline skeleton loader from the image recommendation template into a separate, colocated standalone component.

## 1. Objectives

* **High Cohesion & Colocation**: Create a dedicated `ImageRecommendationSkeleton` within the `image-recommendation-skeleton/` feature folder to keep template presentation logic clean.
* **Component Extraction**: Clean up `image-recommendation.html` by replacing 40 lines of layout skeleton HTML markup with a custom tag `<app-image-recommendation-skeleton />`.
* **Zero Shared Contamination**: Localize the component to prevent premature abstraction and keep the shared UI folder clean.

---

## 2. Architecture & Design

The skeleton is specific to the layout of `ImageRecommendation`, displaying 3 rows of staggered placeholder lines next to avatar/circular items. Place this skeleton component within `src/app/features/image-analysis/image-recommendation-skeleton/` ensures that any future changes to the recommendation structure will only require edits within this directory.

The newly created component `ImageRecommendationSkeleton` will be defined as an Angular Standalone component with inline template and styling, avoiding unnecessary CSS file clutter since all skeleton utility classes (e.g. `skeleton-circle`, `skeleton-line`, `animate-pulse`) are already defined in the global `styles.css`.

---

## 3. Refactoring Steps

### Step 1: Create Image Recommendation Skeleton Component (`src/app/features/image-analysis/image-recommendation-skeleton/image-recommendation-skeleton.ts`)

Create the new subcomponent file:

```typescript
import { Component } from '@angular/core';

const ODD_ROW_CLASSES = ['w-1/4', 'w-5/6'];
const EVEN_ROW_CLASSES = ['w-1/3', 'w-3/4'];

@Component({
  selector: 'app-image-recommendation-skeleton',
  template: `<div class="animate-pulse space-y-4 py-3">
    @for (row of segmentRows; track $index) {
      <div class="flex gap-4">
        <div class="skeleton-circle"></div>
        <div class="flex-1 space-y-2 py-1">
          @for (line of row; track line) {
            <div class="skeleton-line {{ line }}"></div>
          }
        </div>
      </div>
    }
  </div>`,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class ImageRecommendationSkeleton {
  readonly segmentRows = [ODD_ROW_CLASSES, EVEN_ROW_CLASSES, ODD_ROW_CLASSES];
}
```

### Step 2: Import Skeleton Component in Parent (`src/app/features/image-analysis/image-recommendation/image-recommendation.ts`)

Import and declare `ImageRecommendationSkeleton` in `imports`:

```typescript
import { ImageRecommendationSkeleton } from '@/features/image-analysis/image-recommendation-skeleton/image-recommendation-skeleton';
import { RecommendationItem } from '@/shared/ui/components/recommendation-item/recommendation-item';
import { RecommendationList } from '@/shared/ui/components/recommendation-list/recommendation-list';
import { Component, input } from '@angular/core';
import { Recommendation } from '../types/recommendation.type';

@Component({
  selector: 'app-image-recommendation',
  imports: [RecommendationList, RecommendationItem, ImageRecommendationSkeleton],
    templateUrl: './image-recommendation.html',
  styleUrl: './image-recommendation.css',
})
export class ImageRecommendation {
  recommendations = input<Recommendation[] | undefined>(undefined);
}

```

### Step 3: Swap Fallback Markup in External HTML (`src/app/features/image-analysis/image-recommendation/image-recommendation.html`)

Replace the hardcoded HTML skeleton block inside the external HTML template under the `@else` branch with the new custom skeleton tag:

```html
<div class="analysis-section-card space-y-4">
  <h3 class="section-title">
    <span class="material-symbols-outlined section-title-icon">auto_awesome</span>
    Visual & Composition Insights
  </h3>
  @if (recommendations(); as recs) {
    <app-recommendation-list>
      @for (rec of recs; track rec.recommendation) {
        <app-recommendation-item>
          <span indicator class="recommendation-indicator"></span>
          <span title>{{ rec.recommendation }}</span>
          {{ rec.sentence }}
        </app-recommendation-item>
      }
    </app-recommendation-list>
  } @else {
    <app-image-recommendation-skeleton />
  }
</div>
```

---

## 4. Verification & Validation

* Compile the workspace using `npm run build` to ensure there are no compilation or template syntax errors.
* Verify that the skeleton displays correctly when recommendations are in the loading/fetching state.
