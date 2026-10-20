# 25: Implement Culinary Guide Layout, Race Guard, Cache Bypass, and Test Suite

**What to build:**
End-to-end integration and polish of the culinary guide feature with responsive CSS in `culinary-guide.component.css`, race condition prevention via `#searchId`, immediate recipe cache bypass, error handling, documentation in `GLOSSARY.md` and `DESIGN.md`, and comprehensive unit tests in `culinary-guide.component.spec.ts`.

**Blocked by:** 24: Create Shared Spinner Icon and Integrate Loading State into Search Box and Guide Component

**Status:** ready-for-agent

- [ ] Update `GLOSSARY.md` with "Canonical Key Normalization" and "Recipe Synthesis Failure"
- [ ] Update `DESIGN.md` with Culinary Guide Layout Specification and search loading state
- [ ] Implement layout container styles in `culinary-guide.component.css` using design system tokens
- [ ] Add `#searchId` counter in `CulinaryGuideComponent.search()` to discard out-of-order chunks from older searches
- [ ] Reset `recipes` and `expandedDishNames` in `search()` on the first chunk received
- [ ] In `loadRecipe()`, return cached recipe immediately without invoking the coordinator if `this.recipes()[normalizedKey]` is present
- [ ] In `loadRecipe()`, wrap stream in `try / catch` to handle errors gracefully without permanent skeletons
- [ ] Implement unit test suite in `culinary-guide.component.spec.ts` covering:
  - Initial creation and signals
  - `search()` chunk streaming and state resets on first chunk
  - Search race condition discarding stale chunks
  - Search error fallback to `DEFAULT_DISCOVERY_DATA`
  - `loadRecipe()` streaming, cache hit immediate return, and error handling
  - Verification of `tokenSummary` and `tokenModalityBreakdown`
