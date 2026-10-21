# 25: Implement Culinary Guide Layout, Race Guard, Cache Bypass, and Test Suite

**What to build:**
End-to-end integration and polish of the culinary guide feature with responsive CSS in `culinary-guide.component.css`, race condition prevention via `#searchId`, error handling, documentation in `GLOSSARY.md` and `DESIGN.md`, and comprehensive unit tests in `culinary-guide.component.spec.ts`.

**Blocked by:** 24: Create Shared Spinner Icon and Integrate Loading State into Search Box and Guide Component

**Status:** done

- [x] Update `GLOSSARY.md` with "Canonical Key Normalization" and "Recipe Synthesis Failure"
- [x] Update `DESIGN.md` with Culinary Guide Layout Specification and search loading state
- [x] Implement layout container styles in `culinary-guide.component.css` using design system tokens
- [x] Add `#searchId` counter in `CulinaryGuideComponent.search()` to discard out-of-order chunks from older searches
- [x] In `loadRecipe()`, wrap stream in `try / catch` to handle errors gracefully with fallback to `DEFAULT_RECIPE_DATA` without permanent skeletons
- [x] Implement unit test suite in `culinary-guide.component.spec.ts` covering:
  - Initial creation and signals
  - `search()` chunk streaming and state resets on first chunk
  - Search race condition discarding stale chunks
  - Search error fallback to `DEFAULT_DISCOVERY_DATA`
  - `loadRecipe()` streaming, cache hit immediate return, and error handling
  - Verification of `tokenSummary` and `tokenModalityBreakdown`
