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

## 3. Angular Reactivity & Forms

- **Signal Forms Exclusively**: All forms MUST use `@angular/forms/signals`. Legacy reactive forms (`FormGroup`, `FormControl`, `FormBuilder`) and template-driven forms are strictly forbidden.
- **Signal Localization**: Presentation-only state (pagination, sort column, modal visibility) must reside locally in components or view helpers, not in parent data services.

## 4. Tailwind CSS v4 & Styling

- **Component Styles**: Prioritize Tailwind CSS v4 `@apply` classes over raw vanilla CSS.
- **Design Tokens**: Use design tokens from `@theme` in `src/styles.css` (e.g. `text-(--color-text-secondary)`) instead of raw hardcoded colors.
- **Unified Page Shells**: All pages must inherit the standardized `.app-page-shell` layout rather than declaring hardcoded background overrides or `min-h-screen`.

## 5. UI Icons & Assets

- **Zero-Dependency Icons**: Implement UI icons as standalone SVG components under `src/app/shared/ui/icons/` with `styleUrl: './icon.css'` (`:host { @apply app-icon; }`). Do not install icon packages or font icons.
- **PWA Icons**: Icons in `public/icons/` must match their exact pixel dimensions (192x192 for `icon-192.png`, 512x512 for `icon-512.png`).

## 6. Asynchronous & Fire-and-Forget Operations

- **Floating Promises Handling**: At caller sites requiring non-blocking / fire-and-forget execution, handle the returned Promise with `.catch(...)` to satisfy `@typescript-eslint/no-floating-promises`.
- **Ban `void` Operator Keyword**: Never use the `void` expression operator keyword (e.g. `void this.method()`) at call sites.

## 7. Deferred Component Empty State Invariant

- **One-Way Hydration & Empty State Invariant**: Angular `@defer (when condition)` triggers hydration once and never reverts to `@placeholder` if data becomes falsy or is cleared post-hydration. While the parent `@placeholder` handles initial FCP/CLS, every deferred child component rendering nullable or dynamic models MUST maintain an internal `@empty` or `@else` fallback state to safely handle data resets.

## 8. Architectural Layer Hierarchy & Boundary Invariants

The codebase enforces a strict Directed Acyclic Graph (DAG) layer hierarchy via deterministic ESLint `no-restricted-imports` rules:

$$\text{Features} \longrightarrow \text{Shared} \longrightarrow \text{Core}$$

- **Core Layer (`src/app/core/<domain>/`)**: Pure business logic, services, and models. Zero dependencies on `shared` or `features`.
- **Shared Layer (`src/app/shared/`)**: Reusable UI components, pipes, directives, icons, and styles. Zero dependencies on `features`.
- **Feature Layer (`src/app/features/<feature>/`)**: Route-level and feature-specific components and view models. Features may depend on `core` and `shared`, but direct cross-feature imports between sibling features are strictly forbidden.
- **Companion Skeletons**: Loading and placeholder skeletons must always reside in the exact same layer as their primary component (e.g. shared component skeletons reside in `src/app/shared/ui/components/`, feature skeletons in `src/app/features/<feature>/`).
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
