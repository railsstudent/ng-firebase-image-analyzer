# 20: Build CulinaryDiscoveryPanelComponent with Dual Tabs and Update Glossary

**What to build:** Add the canonical `Culinary Discovery Panel` entry to `GLOSSARY.md`, and build the standalone `CulinaryDiscoveryPanelComponent` (`app-culinary-discovery-panel`) under `src/app/features/culinary-guide/culinary-discovery-panel/` with an empty state and a dual-tabbed container rendering Thought Summary (with Honorable Mention Dishes) and deferred Modality Tokens analytics.

**Blocked by:** 18: Elevate DisplaySource to Core Firebase Domain and Compute in AiService

**Status:** ready-for-agent

- [ ] In `GLOSSARY.md`, add **Culinary Discovery Panel** to the `Language` section:
  - Definition: The dual-tabbed interface presenting Stage 1 Culinary Discovery AI insights, consisting of the AI Reasoning Summary with Honorable Mention Dishes and Modality Tokens analytics.
  - _Avoid_: Discovery tabs, culinary result panel, food info card.
- [ ] Create `CulinaryDiscoveryPanelComponent` in `src/app/features/culinary-guide/culinary-discovery-panel/culinary-discovery-panel.component.ts`:
  - Selector: `app-culinary-discovery-panel`.
  - Input: `discovery = input<StreamingCulinaryDiscoveryWithMetadata | undefined>(undefined)`.
  - Imports: `TabGroupComponent`, `TabComponent`, `ThoughtSummaryComponent`, `TokenAnalyticsComponent`, `ListSkeletonComponent`.
  - Styles: Local `.css`, `src/app/shared/ui/styles/section-card.css`, and `src/app/shared/ui/styles/empty-state.css`.
  - Invariant: Do not create a barrel file (`index.ts`) in the feature directory.
- [ ] Create template `src/app/features/culinary-guide/culinary-discovery-panel/culinary-discovery-panel.component.html`:
  - When `!discovery()`: Render an empty-state card with copy: `"No culinary discovery results available yet. Select a destination to explore iconic dishes and AI insights."`.
  - When `discovery()` is present: Render `<app-tab-group>`.
  - Tab 1 (`id="thought"`, `label="Thought Summary"`): Render `<app-thought-summary>` binding `[displaySource]="d.displaySource || 'Unknown'"`, `[thoughtSummary]="d.thoughtSummary || 'No technical logs provided.'"`, `remarksTitle="Honorable Mention Dishes"`, and `[remarks]="d.honorableMentions?.length ? d.honorableMentions : undefined"`.
  - Tab 2 (`#tokensTab`, `id="tokens"`, `label="Token Analytics"`): Wrap in `@defer (when tokensTab.isActive())` with placeholder `<app-list-skeleton />`, rendering `<app-token-analytics [tokenSummary]="d.tokenSummary" [tokenModalityBreakdown]="d.tokenModalityBreakdown" />`.
- [ ] Create `src/app/features/culinary-guide/culinary-discovery-panel/culinary-discovery-panel.component.css` for local container styles.
- [ ] Create unit test suite in `src/app/features/culinary-guide/culinary-discovery-panel/culinary-discovery-panel.component.spec.ts`:
  - Verify empty state card renders when `discovery` input is `undefined`.
  - Verify `<app-tab-group>` renders with tabs `"Thought Summary"` and `"Token Analytics"` when discovery data is provided.
  - Verify Tab 1 binds `displaySource`, `thoughtSummary` fallback, and `honorableMentions` with `remarksTitle="Honorable Mention Dishes"`.
  - Verify Tab 1 renders skeleton when `honorableMentions` is empty `[]`.
  - Verify Tab 2 `@defer` activates on selection and renders `<app-token-analytics>` with token summaries.
- [ ] Maintain repository standards: zero `!`, zero `../`, native `#` for private state/dependencies, and ensure all tests pass with `npx ng test --watch=false`.
