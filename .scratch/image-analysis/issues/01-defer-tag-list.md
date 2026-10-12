# 01: Defer Tag List Component with Parent Empty-State Placeholder

**What to build:**
Deferred loading for the semantic visual tags section. When the image analysis workspace loads, the tag list JavaScript bundle is not downloaded or parsed immediately. Instead, users see an empty-state message indicating no tags have been extracted yet. When image analysis runs and tags are detected, the tag list component dynamically loads and displays the detected visual classifications without layout shift.

**Blocked by:** None (can start immediately)

**Status:** done

## Acceptance criteria

- [x] Wrap `app-tag-list` in an independent `@defer (when tags().length > 0)` block in `image-analysis.component.html` without idle prefetching.
- [x] Implement a `@placeholder` in `image-analysis.component.html` showing the section subtitle and empty-state guidance (`"No tags detected yet. Run image analysis to extract visual labels."`).
- [x] Define `.empty-state-text` in `image-analysis.component.css` using `@apply text-sm text-(--color-on-surface-variant) italic;` for the placeholder.
- [x] Remove redundant `@empty` block inside `tag-list.component.html`.
- [x] Remove unused `.tag-list-empty` class from `tag-list.component.css`.
- [x] Unit tests in `image-analysis.component.spec.ts` verify the placeholder renders on initial load and the deferred tag list hydrates when tags are populated.
- [x] Unit tests in `tag-list.component.spec.ts` pass cleanly with zero lint and test failures.
