# 24: Create Shared Spinner Icon and Integrate Loading State into Search Box and Guide Component

**What to build:**
Create an accessible standalone inline SVG spinner icon component, introduce `isLoading = signal(false)` in `CulinaryGuideComponent` that updates across the search stream lifecycle and binds to `CulinarySearchBoxComponent`, which disables form submission and renders the spinner during active searches.

**Prototype Snippet (Spinner Icon Component):**

```typescript
// src/app/shared/ui/icons/spinner-icon/spinner-icon.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="w-full h-full" aria-hidden="true">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  `,
  styleUrl: '../icon.css',
})
export class SpinnerIconComponent {}
```

**Blocked by:** 23: Export Canonical Key Normalization and Adopt Across Feature Components

**Status:** done

- [x] Create standalone `SpinnerIconComponent` in `src/app/shared/ui/icons/spinner-icon/spinner-icon.component.ts` matching the prototype snippet
- [x] Declare `readonly isLoading = input(false)` on `CulinarySearchBoxComponent`
- [x] Update `CulinarySearchBoxComponent` template to disable submit button when `searchForm().invalid() || isLoading()`
- [ ] Render `<app-spinner-icon class="loading-spinner" />` inside the search submit button when `isLoading()` is true. Add `.loading-spinner { @apply animate-spin text-on-primary w-4 h-4 mr-2;
}` to `culinary-search-box.component.css`.
- [x] Declare `isLoading = signal(false)` in `CulinaryGuideComponent`
- [x] Bind `[isLoading]="isLoading()"` to `<app-culinary-search-box>` in `culinary-guide.component.html`
- [x] Update `isLoading` in `CulinaryGuideComponent.search()` (`set(true)` on start, `set(false)` in `finally`)
- [x] Unit tests for `CulinarySearchBoxComponent` assert disabled state and spinner presence when `isLoading` is true
