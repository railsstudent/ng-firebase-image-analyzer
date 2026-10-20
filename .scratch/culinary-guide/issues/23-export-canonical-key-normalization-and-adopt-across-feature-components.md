# 23: Export Canonical Key Normalization and Adopt Across Feature Components

**What to build:**
Export `normalizeKey` from core validation and public index, and adopt it across all culinary guide layers (`CulinaryGuideCoordinatorService`, `CulinaryGuideComponent`, `CulinarySearchBoxComponent`, and `CulinaryDishListComponent`) so that dictionary lookups, cache keys, and city matching share a single canonical normalization rule.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Export `normalizeKey(key: string | undefined): string` from `src/app/core/culinary-guide/culinary-guide.validation.ts`
- [ ] Re-export `normalizeKey` from `src/app/core/culinary-guide/index.ts`
- [ ] Adopt `normalizeKey` in `CulinaryGuideCoordinatorService.buildRecipeCacheKey` for target properties
- [ ] Adopt `normalizeKey` in `CulinaryGuideComponent` for `recipes` dictionary key access and storage in `loadRecipe`
- [ ] Adopt `normalizeKey` in `CulinarySearchBoxComponent` for city filtering and validation matching
- [ ] Adopt `normalizeKey` in `CulinaryDishListComponent` template for dish recipe lookup (`recipes()[normalizeKey(dish.name)]`)
- [ ] Existing core validation and component unit tests pass cleanly
