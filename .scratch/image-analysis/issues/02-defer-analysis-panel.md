# 02: Defer Image Analysis Panel with Empty-State Placeholder Card

**What to build:**
Deferred loading for the advanced image analysis panel (thought summary, recommendations, token analytics, and visual calibration). On initial load, the heavy analysis panel bundle is deferred, and users see a styled placeholder card indicating no analysis data is present. When streaming analysis begins and data arrives, the panel component dynamically hydrates while preserving elapsed time streaming indicators in the action button.

**Blocked by:** 01: Defer Tag List Component with Parent Empty-State Placeholder

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Wrap `app-image-analysis-panel` in an independent `@defer (when analysisData())` block in `image-analysis.component.html` without idle prefetching.
- [ ] Implement a `@placeholder` in `image-analysis.component.html` rendering a structured card with placeholder text (`"No analysis results available yet. Upload an image and click 'Analyze Image' to inspect AI insights."`).
- [ ] Maintain `isLoading()` and `seconds()` streaming loader badge and action button behavior without interference from template `@loading` blocks.
- [ ] Maintain fixed container constraints to ensure Cumulative Layout Shift (CLS) remains 0 when the panel transitions from placeholder to hydrated component.
- [ ] Unit tests in `image-analysis.component.spec.ts` verify that the analysis panel placeholder renders when `analysisData()` is null and hydrates when `analysisData()` is set.
- [ ] Passes `npm run lint` and `npm run test:once` with zero regressions.
