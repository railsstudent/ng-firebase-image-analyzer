# Coding Standards & Architectural Invariants

> [!NOTE]
> General Angular framework-level best practices are defined in [../../.gemini/GEMINI.md](../../.gemini/GEMINI.md). Repository invariants below take precedence.

This document outlines project-specific coding standards and architectural conventions.

## 1. Import Rules

- **Sibling Relative Imports (`./`)**: Allowed and preferred for files within the same directory.
- **Absolute Path Aliases (`@/`)**: Required for all cross-directory imports.
- **Parent Relative Imports (`../`)**: Strictly forbidden in all TypeScript files (`no-restricted-imports`).
- **CSS Exception**: Component CSS files MUST use relative paths for `@reference` directives (e.g. `@reference "../../../../../styles.css";`), as CSS does not support TypeScript path aliases.
- **Type-Only Imports (`import type`)**: Always use explicit `import type { ... }` when importing TypeScript interfaces, types, or type aliases to guarantee compile-time elision and prevent circular dependency false positives.
- **Barrel (`index.ts`) Discipline**:
  - `src/app/core/<domain>/`: Cross-domain consumers MUST import through `@/core/<domain>`. Package-internal helpers, schemas, or validators MUST NOT be re-exported in `index.ts`.
  - `src/app/features/`: Barrel files are strictly forbidden to preserve `@defer` chunk boundaries and prevent bundle bloat.

## 2. Encapsulation & Private Members

- **Methods**: Always use the TypeScript `private` keyword (`private fetchImage(...)`). Do NOT use `#` prefixes on class methods (enforced by `no-restricted-syntax`).
- **State & Injected Dependencies**: Always use JavaScript native `#` prefixes for private properties, state signals, and class-internal injected services that are not exposed to templates (`readonly #state = signal(...)`, `readonly #nav = inject(NavService)`).
- **Angular Signal Queries & Compiler Metadata Exception**: Signal query properties (`viewChild`, `viewChildren`, `contentChild`, `contentChildren`) as well as `input`, `output`, and `model` declarations MUST NOT use native `#` prefixes—even when only read internally within the class—because Angular's AOT compiler emits external metadata accessors outside the class lexical body that fail to compile with `#`.

## 3. Angular Reactivity, Lifecycle & Forms

- **Signal Forms Exclusively**: All forms MUST use `@angular/forms/signals`. Legacy reactive forms (`FormGroup`, `FormControl`, `FormBuilder`) and template-driven forms are strictly forbidden.
- **Signal Localization**: Presentation-only state (pagination, sort column, modal visibility) must reside locally in components or view helpers, not in parent data services.
- **Component Cleanup (`DestroyRef`)**: Always use `inject(DestroyRef).onDestroy(...)` (or `afterNextRender` cleanup callbacks) for component and directive teardown logic instead of implementing the legacy `OnDestroy` interface / `ngOnDestroy()` lifecycle hook.

## 4. Tailwind CSS v4 & Styling

- **Component Styles**: Prioritize Tailwind CSS v4 `@apply` classes over raw vanilla CSS, and import [src/section-card.css](../../src/section-card.css) and [src/layout.css](../../src/layout.css) through [src/styles.css](../../src/styles.css) for shared card and header/footer primitives.
- **Design Tokens & Contract Synchronization**: Use semantic design tokens from `@theme static` in [src/styles.css](../../src/styles.css) (e.g. `bg-surface-card`, `text-on-surface-variant`) instead of raw hardcoded colors, and synchronize any change to `@theme` tokens or component visual contracts in the same task/plan with [DESIGN.md](../../DESIGN.md) and [ADR-0022](../adr/0022-zero-dependency-fonts-and-design-tokens.md).
- **Layer Specificity & Redundancy Hygiene**: Keep coupled base and responsive/pseudo-class `x:*` utility pairs (`flex-col` + `sm:flex-row`, `border` + `focus-visible:border-2`) in the same `.css` or `.html` layer (`<= 3` classes per HTML element), and avoid utilities that duplicate Tailwind v4 Preflight defaults (`placeholder:*`) or trigger unnecessary `@property` boilerplate (`focus:ring-*`).

## 5. UI Icons & Assets

- **Zero-Dependency Icons**: Implement UI icons as standalone SVG components under `src/app/shared/ui/icons/` binding `host: { class: 'app-icon ...' }` (backed by global `.app-icon` and `.app-icon > svg` rules in `src/styles.css`). Do not install icon packages or font icons.
- **PWA Icons**: Icons in `public/icons/` must match their exact pixel dimensions (192x192 for `icon-192.png`, 512x512 for `icon-512.png`).

## 6. Asynchronous Operations & Lazy DI Boundaries

- **Floating Promises Handling**: At caller sites requiring non-blocking / fire-and-forget execution, handle the returned Promise with `.catch(...)` to satisfy `@typescript-eslint/no-floating-promises`.
- **Ban `void` Operator Keyword**: Never use the `void` expression operator keyword (e.g. `void this.method()`) at call sites.
- **Single-Hop `injectAsync` Boundary**: Place `injectAsync` strictly at the **Feature Component** entry boundary (`*.component.ts` ➔ Coordinator or Core Domain Service) to keep initial route shells (`FCP`/`LCP`) free of service-graph weight, and use synchronous `inject()` inside all downstream Coordinator and Core Domain services (`*.service.ts`) so the bundler emits static ESM imports that the browser fetches in parallel rather than in a sequential multi-hop waterfall. Before introducing any lazy boundary, apply this 3-point check:
  1. **Upstream Boundary Check**: Verify whether the caller is already behind an `injectAsync` boundary; once inside a lazy service chunk, use synchronous `inject()` for downstream services.
  2. **Co-Execution Probability**: Reserve secondary lazy boundaries inside an already-lazy service strictly for conditional or Stage-2 branches (e.g. `snarkdown` + `dompurify` in `MarkdownFormatterService`, or staged Firebase SDK chunks in `ConfigService`). Services that execute on 100% of calls to their parent service (e.g. `ImageAnalysisService` / `CulinaryGuideService` ➔ `AiService`) must use synchronous `inject()`.
  3. **Sibling Static Imports & Barrel Splitting**: Check whether the file already statically imports from the target vendor package (e.g. `import { Schema } from 'firebase/ai'`) or from the same barrel (`index.ts`), as static imports in the same chunk already bind the vendor module.

## 7. Deferred Component Empty State Invariant

- **One-Way Hydration & Empty State Invariant**: Angular `@defer (when condition)` triggers hydration once and never reverts to `@placeholder` if data becomes falsy or is cleared post-hydration. While the parent `@placeholder` handles initial FCP/CLS, every deferred child component rendering nullable or dynamic models MUST maintain an internal `@empty` or `@else` fallback state to safely handle data resets.

## 8. Architectural Layer Hierarchy & Boundary Invariants

The codebase enforces a strict Directed Acyclic Graph (DAG) layer hierarchy via deterministic ESLint `no-restricted-imports` rules:

$$\text{Features} \longrightarrow \text{Shared} \longrightarrow \text{Core}$$

- **Core Layer (`src/app/core/<domain>/`)**: Pure business logic, services, and models. Zero dependencies on `shared` or `features`.
- **Shared Layer (`src/app/shared/`)**: Reusable UI components, pipes, directives, icons, and styles. Zero dependencies on `features`.
- **Feature Layer (`src/app/features/<feature>/`)**: Route-level and feature-specific components and view models. Features may depend on `core` and `shared`, but direct cross-feature imports between sibling features are strictly forbidden.
- **Platform Envelope vs. Domain Payload Separation**:
  - **Canonical Platform Envelopes**: Cross-cutting runtime and infrastructure concerns (e.g., execution telemetry, token usage, inference source, streaming lifecycle, transport pagination/error wrappers) MUST be defined as canonical envelope contracts in their respective `src/app/core/<platform>/` package (e.g., `InferenceMetadata` in `src/app/core/firebase/`).
  - **Zero Inline Redefinition**: Domain contracts (`src/app/core/<domain>/`) must only declare pure business payload attributes. Domain models MUST NEVER redefine platform envelope fields inline; they must compose or extend the canonical platform envelope (e.g., `StreamingXWithMetadata extends InferenceMetadata`). Sibling domains consuming the same core platform capabilities MUST share the identical underlying envelope contract.
- **Shared Service Boundaries & Raw Object Unpacking**:
  - **Shared services deliver finished data (finish the job)**: When a service wraps an external library (Firebase, HTTP clients, third-party APIs), it should unpack the response internally and return clean, ready-to-use data. Callers should not have to reach into raw vendor objects (e.g. `response.candidates[0]`, `response.headers.get(...)`) or call secondary helpers just to decode them (`const res = await service.getData(); const meta = service.unpack(res.raw);`).
  - **Check other callers before writing local helpers**: If you are writing a helper to parse or extract fields from a shared service's response, search for other callers of that shared service across the codebase. If multiple features need that same extraction, put it on the shared service instead of writing duplicate private helpers in each feature.
  - **Avoid over-engineered control wrappers**: Don't invent complex generic functions or large config objects to merge similar-looking methods. Moving shared data extraction down to the underlying service usually makes the callers simple enough on their own.

## 9. Generative AI Schema & Contract Equivalence

- **1:1 Contract Mirroring**: Every structured generative AI schema (`TypedSchema` or `SchemaRequest`) MUST have an exact 1:1 TypeScript domain interface mirroring its JSON shape (e.g., `TopFoodsResponse` strictly matches `TopFoodsSchema`).
- **Streaming Wrapper Types**: Every streaming generator method returning metadata (inference source, thought summaries, token analytics) MUST declare and export an explicit streaming wrapper interface (e.g., `StreamingCulinaryDiscoveryWithMetadata`).
- **Composite Contract Parameters & Destructuring**: Functions and service methods operating on multi-attribute domain data should type against the canonical domain contract rather than decomposing fields into loose positional arguments (avoiding primitive obsession and data clumps). Prefer parameter destructuring in the signature for concise, readable access:

  ```typescript
  // Recommended: Destructured canonical domain contract
  export function isValidDiscoveryResponse({ foods, honorableMentions }: TopFoodsResponse): boolean { ... }
  getRecipeStream({ country, city, dishName }: CulinaryRecipeTarget): AsyncGenerator<...> { ... }

  // Avoid: Loose positional arguments (Data Clump)
  export function isValidDiscoveryResponse(foods: CulinaryFoodItem[], mentions: string[]): boolean { ... }
  getRecipeStream(country: string, city: string, dishName: string): AsyncGenerator<...> { ... }
  ```

## 10. Micro-Library Capability Audits & Fallbacks

- **Typing Verification**: Before proposing external `@types/*` dependencies, verify whether the target package already ships built-in TypeScript declarations.
- **Micro-Library Boundaries**: When selecting lightweight parsers over full-featured engines (e.g. `snarkdown` for bundle isolation), audit syntax limitations upfront and implement a two-tier defense:
  1. **Prompt Guardrail**: Direct the model explicitly against unsupported syntax (e.g., "Use bulleted lists; never output tables").
  2. **Client Fallback Normalizer**: Provide defensive client-side parsing/transformation to normalize non-conforming content before passing it to the micro-library.

## 11. Diagnostic, Telemetry & Error String Preservation

- **Immutable Behavioral Contracts**: During structural refactoring or delegation to internal utilities, all console logs, telemetry payloads, and thrown `Error` messages—including dynamic interpolation arguments (e.g., `${size}x${size}`)—are strictly immutable behavioral contracts.
- **Zero Aggressive Pruning**: Never truncate, rephrase, or remove arguments from log or error messages unless explicitly mandated by the ticket's Acceptance Criteria. If a refactor removes an intermediate variable, calculate or pass the necessary argument to retain the exact diagnostic output format.

## 12. Domain-Cohesive Constants & Behavioral Encapsulation

- **Zero "Junk Drawer" Constants Files**: Never create grab-bag or generic constants files (e.g. `common.const.ts`, `metrics.const.ts`, `globals.const.ts`). Constants files must be cohesive and organized by strict domain or dimensional concepts (e.g., `time.const.ts`, `math.const.ts`, `image.const.ts`, `navigator.const.ts`).
- **Domain Accuracy Over Syntax Appeasement**: Do not use "metrics" as a label for unit conversion scales or mathematical factors. In this codebase, "metrics" and "telemetry" are strictly reserved for runtime system measurements (tokens, latency, memory).
- **Prefer Behavioral Utilities Over Naked Numbers**: When satisfying `@typescript-eslint/no-magic-numbers` for units of measurement (percentages, millisecond durations, byte sizes), prefer encapsulating the transformation in pure, testable utility functions (`toPercentString()`, `formatDurationSeconds()`, `calculatePercentage()`) rather than exporting raw numbers for callers to perform manual arithmetic and string concatenation.
- **Dimensional Units in Time Constants**: Time constants must explicitly state their dimensional units in their names (e.g., `MS_PER_SECOND`, `SECONDS_PER_MINUTE`, `ONE_HOUR_MS`) rather than ambiguous names like `MILLISECONDS` or `SECONDS`.
