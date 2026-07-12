# 12. CSS Grid Alignment and Canvas Container Sizing Fixes

We decided to apply grid column spans directly to component `:host` elements to resolve the CSS Grid layout bug, and explicitly set the crop canvas container width to 100% to resolve the canvas sizing bug. We also decided to use a 1:2 ratio grid layout, center the canvas container, and format the coordinate string into a highly compact form to prevent coordinate label wrapping and visual spillover.

## Context

Following the refactoring of the applied filters list, two visual layout bugs were observed:

1. The `<app-image-crop>` and `<app-enhanced-canvas>` components did not span correctly across the 4-column grid layout, appearing squished.
2. The canvas preview box rendered extremely small.
3. On a 1:3 ratio, the crop bounds text coordinates wrapped awkwardly onto multiple lines. Additionally, because the canvas container has a square aspect ratio and a max height of 400px, it left a massive blank space on the right of its 3-column span on wide screens.

The column spans (`md:col-span-1` and `md:col-span-3`) were previously applied to inner HTML wrappers inside the child templates. Because the parent CSS Grid container `.improvement-grid` treats the custom element selectors as its direct children, these internal spans had no effect on the overall grid layout.

Furthermore, custom Angular components are compiled as `display: inline` by default. Under a CSS Grid layout, inline elements fail to establish proper block formatting contexts, leading to children sizing themselves wider than the column boundaries and spilling over.

## Decision

1. **Encapsulated Grid Positioning & Block Display**: We will target the host elements directly in the sub-component stylesheets using `:host` to declare both `display: block` (via `@apply block`) and column spans. This forces the components to act as block-level grid items that adhere strictly to their column constraints.
2. **1:2 Grid Ratio (3-Column Layout)**: We will change the parent container `.improvement-grid` to a 3-column grid (`grid-cols-3`). This grants the sidebar 33.3% width (`col-span-1`), providing enough room to prevent text wrapping of crop coordinate labels, and leaves the canvas with 66.6% width (`col-span-2`).
3. **Centered Showcase Canvas**: We will center the canvas container wrapper (`max-w-[400px] mx-auto`) inside its 2-column allocated space to provide a premium, focused hero preview aesthetic with balanced margins.
4. **Compact Coordinates Representation**: To completely prevent wrapping of crop bounds on smaller or crowded monitors, we will format the raw coordinates string from `xMin: 0.12, xMax: 0.88, yMin: 0.05, yMax: 0.95` (46 chars) into an ultra-compact mathematical spatial range format `X: 0.12–0.88 | Y: 0.05–0.95` (23 chars).
5. **Explicit Full-Width Canvas Sizing**: We will update `image-improvement.ts` to pass `100` as the container width parameter to `imageEffect.cropImage()`, ensuring the canvas expands to fill the full width of its allocated 2-column span.

## Reference Implementation

### 1. Parent Grid in `image-improvement.css`

```css
.improvement-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-6;
}
```

### 2. Host styles in `image-crop.css`

```css
:host {
  @apply block md:col-span-1;
}
```

### 3. Host styles in `enhanced-canvas.css`

```css
:host {
  @apply block md:col-span-2;
  width: 100%;
}

.canvas-wrapper {
  @apply space-y-4 max-w-[400px] mx-auto;
}
```

### 4. Compact coordinates and explicit sizing in `image-improvement.ts`

```typescript
cropImage = computed(() => this.imageEffect.cropImage(this.safeCrop(), 100));

cropPosition = computed(() => {
  const crop = this.analysis()?.crop;
  const safeCrop = this.sanitizeAdjustment.sanitizeCrop(crop);
  if (safeCrop) {
    return `X: ${safeCrop.xMin}–${safeCrop.xMax} | Y: ${safeCrop.yMin}–${safeCrop.yMax}`;
  }
  return 'N/A';
});
```

## Consequences & Trade-offs

- **Clean Grid Hierarchy**: Direct children of CSS Grid containers are now the ones declaring grid placement, resolving visual layout issues instantly and respecting standard CSS layout flow.
- **Perfect Spillover Prevention**: Declaring `display: block` and `width: 100%` on host elements correctly bounds child content calculations, completely eliminating layout spillover.
- **No Text Wrapping**: Compact layout cuts metadata label string lengths in half, ensuring all bounds read flawlessly in a single line on any screen viewport.
- **Balanced Showcase UI**: Centering the square canvas in its 2-column span delivers a premium, symmetry-based gallery visual on desktop monitors.
