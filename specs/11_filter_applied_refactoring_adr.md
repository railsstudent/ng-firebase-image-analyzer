# 11. Refactoring "Filters Applied" to Dynamic Iteration

We decided to refactor the static list of applied filters in `image-crop` to a dynamic `@for` iteration, while keeping the crop metadata list static. This balances clean templates, extensibility, and sensible component boundaries.

## Context

The image improvement interface displays crop specifications and applied color filters in sidebar lists. Originally, these lists were written statically in the component HTML template. During refactoring, we considered:

1. Extracting the lists into standalone Angular sub-components (`specs-list` and `specs-item`).
2. Keeping all HTML elements completely static.
3. Mapping properties to structured label-value pairs and using `@for` iteration.

## Decision

We will refactor the **Filters Applied** list to iterate over a dynamic list of color adjustments using Angular's `@for` control flow, but we will keep the **Crop Metadata** list static. We rejected extracting these into dedicated sub-components.

Furthermore, we decided to use **Strict keyof Type Annotation** for the keys array (i.e. `const keys: (keyof ColorAdjustment)[] = [...]`) to catch any typos directly on the array elements themselves during compilation, while keeping the mapping fully typesafe and elegant.

## Reference Implementation

### 1. In `image-crop.ts`

```typescript
import { ColorAdjustment } from '@/features/image-analysis/types/color-adjustment.type';
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.html',
  styleUrl: './image-crop.css',
})
export class ImageCrop {
  colorAdjustment = input<ColorAdjustment | undefined>(undefined);
  aspectRatio = input('');
  cropPosition = input('');

  // Dynamically map and format filters with strict keyof type safety
  appliedFilters = computed(() => {
    const adj = this.colorAdjustment();
    const keys: (keyof ColorAdjustment)[] = ['brightness', 'saturation', 'contrast', 'warmth'];

    return keys.map((key) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: adj?.[key] ?? 'N/A',
    }));
  });
}
```

### 2. In `image-crop.html`

```html
<div class="specs-sidebar">
  <div class="specs-box">
    <p class="specs-title">Crop Metadata</p>
    <ul class="specs-list">
      <li class="specs-item"><span class="specs-item-name">Crop Bounds:</span> {{ cropPosition() }}</li>
      <li class="specs-item"><span class="specs-item-name">Aspect Ratio:</span> {{ aspectRatio() }}</li>
    </ul>
  </div>

  <div class="specs-box">
    <p class="specs-title">Filters Applied</p>
    <ul class="specs-list">
      @for (item of appliedFilters(); track item.label) {
        <li class="specs-item">
          <span class="specs-item-name">{{ item.label }}:</span>
          {{ item.value }}
        </li>
      }
    </ul>
  </div>
</div>
```

## Consequences & Trade-offs

- **Extensibility**: Adding new image adjustments in the future (e.g. sepia, blur, contrast) only requires updating the TypeScript data model. No HTML template boilerplate is added.
- **Encapsulation & Low Complexity**: Keeping these styles local to the feature folder and refusing standalone components avoids high boilerplate, extra file overhead, and deep nesting.
- **Readability**: Simple lists remain extremely clean and fast to read for other developers.
