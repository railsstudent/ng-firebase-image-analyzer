# 23: Export Canonical Composite Key Builder and Adopt Across Feature Components

**What to build:**
Extract normalization and key synthesis out of `culinary-guide.validation.ts` into a dedicated domain file `src/app/core/culinary-guide/culinary-guide.normalization.ts` (keeping validation strictly for predicates). Export a single unified `normalizeKeys` from core that directly processes inputs (with a single-item fast-path) without unnecessary helper functions, and adopt it across all culinary guide layers (`CulinaryGuideCoordinatorService`, `CulinaryGuideComponent`, `CulinarySearchBoxComponent`, and `CulinaryDishListComponent`) so that dictionary lookups, cache keys, and city matching share a single canonical entry point without API sprawl or semantic mismatch.

**Key Architecture Pattern:**

```typescript
// src/app/core/culinary-guide/culinary-guide.normalization.ts
export function normalizeKeys(...parts: (string | undefined)[]): string {
  if (parts.length === 1) {
    return parts[0]?.trim()?.toLowerCase() || '';
  }
  return parts.map((part) => part?.trim()?.toLowerCase() || '').join(':');
}
```

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Create `src/app/core/culinary-guide/culinary-guide.normalization.ts` containing `normalizeKeys` and `normalizeDiscoveryResponse`
- [x] Keep `src/app/core/culinary-guide/culinary-guide.validation.ts` strictly for validation predicates (`isValidDiscoveryResponse`, `isValidRecipeResponse`)
- [x] Export `normalizeKeys` and `normalizeDiscoveryResponse` from `src/app/core/culinary-guide/index.ts`
- [x] Adopt `normalizeKeys` in `CulinaryGuideCoordinatorService.buildRecipeCacheKey` for composite target properties
- [x] Adopt `normalizeKeys` in `CulinaryGuideComponent` for `recipes` dictionary key access and storage in `loadRecipe`
- [x] Adopt `normalizeKeys` in `CulinarySearchBoxComponent` for city filtering and validation matching
- [x] Adopt `normalizeKeys` in `CulinaryDishListComponent` template for dish recipe lookup (`recipes()[normalizeKeys(dish.name)]`)
- [x] Add unit tests in `src/app/core/culinary-guide/culinary-guide.normalization.spec.ts`
- [x] Verify core validation, normalization, and component unit tests pass cleanly
