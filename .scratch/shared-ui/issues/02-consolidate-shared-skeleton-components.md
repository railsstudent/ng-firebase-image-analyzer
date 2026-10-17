# Ticket 02: Consolidate Shared Skeleton Components into Atomic AppSkeleton Primitive

**What to build:** Retire 3 redundant single-use skeleton components (`token-analytics-skeleton`, `image-recommendation-skeleton`, `image-improvement-skeleton`) and replace them with an atomic, layout-agnostic `<app-skeleton>` primitive under `src/app/shared/ui/components/skeleton/`. Consumers in `ImageAnalysisPanelComponent` and downstream `CulinaryDishListComponent` compose `<app-skeleton>` directly using standard inline Tailwind utility classes (`flex`, `grid`, `space-y-*`), eliminating component sprawl while keeping shared UI free of feature-specific layout presets.

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
    @for (i of lineArray(); track i) {
      <div [class]="getItemClasses(i)" aria-hidden="true"></div>
    }
  `,
  styleUrl: './skeleton.component.css',
})
export class SkeletonComponent {
  variant = input<SkeletonVariant>('line');
  lines = input<number>(1);
  className = input<string>('', { alias: 'class' });

  protected lineArray = computed(() => Array.from({ length: Math.max(1, this.lines()) }, (_, i) => i));

  protected getItemClasses(index: number): string {
    const isMultiLine = this.variant() === 'line' && this.lines() > 1;
    const isLast = index === this.lines() - 1;
    const base = 'skeleton-primitive';
    const variantClass = `skeleton-${this.variant()}`;
    const widthClass = isMultiLine && isLast ? 'w-3/4' : '';
    const extra = this.className();

    return `${base} ${variantClass} ${widthClass} ${extra}`.trim();
  }
}
```

### 3. Component Styles: `src/app/shared/ui/components/skeleton/skeleton.component.css`

```css
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
export * from './skeleton-variant.type';
```

### 5. Consumer Replacement in `src/app/features/image-analysis/image-analysis-panel/image-analysis-panel.component.html`

```html
<!-- Tab 3.2: Recommendations -->
<app-tab #recTab id="detailed" label="Recommendations">
  @defer (when recTab.isActive()) {
  <app-image-recommendation [recommendations]="recommendations" />
  } @placeholder {
  <div class="space-y-4 rounded-xl border border-outline-variant/30 p-4" aria-hidden="true">
    <div class="flex items-center gap-3">
      <app-skeleton variant="circle" class="h-10 w-10 shrink-0" />
      <div class="flex-1 space-y-2">
        <app-skeleton variant="line" class="w-1/3" />
        <app-skeleton variant="line" class="w-2/3" />
      </div>
    </div>
    <app-skeleton variant="line" [lines]="3" />
  </div>
  }
</app-tab>

<!-- Tab 3.3: Token Usage -->
<app-tab #tokensTab id="tokens" label="Token Usage">
  @defer (when tokensTab.isActive()) {
  <app-token-analytics [tokenSummary]="tokenSummary" [tokenModalityBreakdown]="tokenModalityBreakdown" />
  } @placeholder {
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4" aria-hidden="true">
    <div class="space-y-3 rounded-xl border border-outline-variant/30 p-4">
      <app-skeleton variant="line" class="w-1/2" />
      <app-skeleton variant="rect" class="h-24" />
      <app-skeleton variant="line" class="w-3/4" />
    </div>
    <div class="space-y-3 rounded-xl border border-outline-variant/30 p-4">
      <app-skeleton variant="line" class="w-1/2" />
      <app-skeleton variant="rect" class="h-24" />
      <app-skeleton variant="line" class="w-3/4" />
    </div>
  </div>
  }
</app-tab>

<!-- Tab 3.4: Image Improvement -->
<app-tab #improveTab id="improvement" label="Image Improvement">
  @defer (when improveTab.isActive()) {
  <app-image-improvement [analysis]="innerAnalysis" [imageUrl]="imageUrl()" />
  } @placeholder {
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xl border border-outline-variant/30 p-4" aria-hidden="true">
    <div class="md:col-span-2 space-y-3">
      <app-skeleton variant="rect" class="h-64" />
      <app-skeleton variant="line" [lines]="2" />
    </div>
    <div class="space-y-3">
      <app-skeleton variant="line" class="w-3/4" />
      <app-skeleton variant="rect" class="h-32" />
      <app-skeleton variant="rect" class="h-24" />
    </div>
  </div>
  }
</app-tab>
```

---

## Acceptance Criteria & Checklist

- [ ] Create `SkeletonVariant` type in `src/app/shared/ui/components/skeleton/skeleton-variant.type.ts`.
- [ ] Create `SkeletonComponent` in `src/app/shared/ui/components/skeleton/skeleton.component.ts` with inline template and signal inputs (`variant`, `lines`, `className`).
- [ ] Create component styles in `src/app/shared/ui/components/skeleton/skeleton.component.css` leveraging `skeletonPulse`, `--color-skeleton`, and vertical flex host layout.
- [ ] Create public barrel `src/app/shared/ui/components/skeleton/index.ts` exporting `SkeletonComponent` and `SkeletonVariant`.
- [ ] Write unit tests in `src/app/shared/ui/components/skeleton/skeleton.component.spec.ts`:
  - Default variant `'line'` renders with `skeleton-line` and `aria-hidden="true"`.
  - Custom variants `'circle'` and `'rect'` apply corresponding CSS classes.
  - Custom classes passed via `class` input/host are merged into computed class list.
  - Multi-line rendering (`[lines]="3"`) renders 3 elements with the final line having `w-3/4`.
- [ ] Update `ImageAnalysisPanelComponent` (`image-analysis-panel.component.ts` & `image-analysis-panel.component.html`):
  - Replace imports of `TokenAnalyticsSkeletonComponent`, `ImageRecommendationSkeletonComponent`, and `ImageImprovementSkeletonComponent` with `SkeletonComponent` from `@/shared/ui/components/skeleton`.
  - In Tab 3.2 (`#recTab`), replace `<app-image-recommendation-skeleton />` with inline Tailwind layout and `<app-skeleton>`.
  - In Tab 3.3 (`#tokensTab`), replace `<app-token-analytics-skeleton />` with inline Tailwind layout and `<app-skeleton>`.
  - In Tab 3.4 (`#improveTab`), replace `<app-image-improvement-skeleton />` with inline Tailwind layout and `<app-skeleton>`.
  - Verify `image-analysis-panel.component.spec.ts` passes.
- [ ] Delete obsolete legacy skeleton folders (12 files total):
  - `src/app/features/image-analysis/image-recommendation-skeleton/`
  - `src/app/features/image-analysis/image-improvement-skeleton/`
  - `src/app/shared/ui/components/token-analytics-skeleton/`
- [ ] Repository invariants:
  - Zero `!`, zero `../` escaping package boundary, native `#` for private state/deps, TypeScript `private` for methods, and no agent git commits.
