# 19: Refactor ImageAnalysisPanelComponent to Consume Core displaySource

**What to build:** Update `ImageAnalysisPanelComponent` to read `displaySource` directly from `data()?.displaySource` provided by `@/core/firebase`, eliminating duplicate mapping logic, and remove the redundant feature-level `display-source.type.ts` file and directory.

**Blocked by:** 18: Elevate DisplaySource to Core Firebase Domain and Compute in AiService

**Status:** ready-for-agent

- [ ] In `src/app/features/image-analysis/image-analysis-panel/image-analysis-panel.component.ts`, update imports to consume `type { DisplaySource }` from `@/core/firebase`.
- [ ] Refactor `displaySource` computed signal in `ImageAnalysisPanelComponent` to read `this.data()?.displaySource` directly, falling back to formatting `this.source()` if provided standalone, defaulting to `'Unknown'`.
- [ ] Delete `src/app/features/image-analysis/types/display-source.type.ts` and remove the empty `src/app/features/image-analysis/types/` directory.
- [ ] Update unit tests in `src/app/features/image-analysis/image-analysis-panel/image-analysis-panel.component.spec.ts` to verify `displaySource` resolves cleanly from `data()?.displaySource` and standalone `source()`.
- [ ] Maintain repository standards: zero `!`, zero `../`, native `#` for private state/dependencies, and ensure all tests pass with `npx ng test --watch=false`.
