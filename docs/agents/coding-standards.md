# Coding Standards & Architectural Invariants

> [!NOTE]
> General Angular framework-level best practices are defined in [../../.gemini/GEMINI.md](../../.gemini/GEMINI.md). Repository invariants below take precedence.

This document outlines project-specific coding standards and architectural conventions.

## 1. Import Rules

- **Sibling Relative Imports (`./`)**: Allowed and preferred for files within the same directory or child subdirectories.
- **Absolute Path Aliases (`@/`)**: Required for cross-directory imports.
- **Parent Relative Imports (`../`)**: Strictly forbidden in all TypeScript files (`no-restricted-imports`).
- **CSS Exception**: Component CSS files MUST use relative paths for `@reference` directives (e.g. `@reference "../../../../../styles.css";`), as CSS does not support TypeScript path aliases.

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

## 9. Generative AI Schema & Contract Equivalence

- **1:1 Contract Mirroring**: Every structured generative AI schema (`TypedSchema` or `SchemaRequest`) MUST have an exact 1:1 TypeScript domain interface mirroring its JSON shape (e.g., `TopFoodsResponse` strictly matches `TopFoodsSchema`).
- **Streaming Wrapper Types**: Every streaming generator method returning metadata (inference source, thought summaries, token analytics) MUST declare and export an explicit streaming wrapper interface (e.g., `StreamingCulinaryDiscoveryWithMetadata`).

## 10. Micro-Library Capability Audits & Fallbacks

- **Typing Verification**: Before proposing external `@types/*` dependencies, verify whether the target package already ships built-in TypeScript declarations.
- **Micro-Library Boundaries**: When selecting lightweight parsers over full-featured engines (e.g. `snarkdown` for bundle isolation), audit syntax limitations upfront and implement a two-tier defense:
  1. **Prompt Guardrail**: Direct the model explicitly against unsupported syntax (e.g., "Use bulleted lists; never output tables").
  2. **Client Fallback Normalizer**: Provide defensive client-side parsing/transformation to normalize non-conforming content before passing it to the micro-library.
