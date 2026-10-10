# Architecture Decision Record (ADR)

## Title: Zero-Dependency System Fonts, Standalone SVG Icons, and Tailwind CSS v4 Semantic Tokens

- **Status**: Accepted
- **Date**: 2026-10-11
- **Authors**: Antigravity & Team

---

## Context

The application previously relied on external font distributions via `@fontsource` packages (`@fontsource/inter`, `@fontsource/hanken-grotesk`, `@fontsource/geist-mono`) and webfont-based icon glyphs (Google Fonts Material Symbols).

During bundle audits and performance profiling, the following issues were identified:

1. **Significant Asset Overhead**: Bundling multiple `@fontsource` weight cuts and sub-variants inflated the application distribution payload by over **3.4 MB**, delaying initial network downloads and Time to Interactive (TTI).
2. **Flash of Unstyled Text / Layout Shifts**: Loading external webfont files caused layout shifts (CLS) and FOIT/FOUT rendering hitches on constrained network connections.
3. **Inconsistent Styling & Incomplete Design Token Architecture**:
   - While Tailwind CSS v4 introduced the `@theme` directive, custom CSS properties were not mirrored into a global `:root` block, breaking plain CSS expressions, third-party component styles, dynamic element style bindings, and browser devtools auto-completion.
   - Component stylesheets frequently utilized arbitrary property brackets (e.g. `bg-[var(--color-primary)]`), hardcoded utility colors (e.g. `text-red-300`), and legacy `rgba(...)` functions instead of clean Tailwind v4 utility tokens and modern hex alpha transparency.
4. **Fragmented Documentation**: A secondary design specification existed at `src/app/features/image-analysis/Design.md`, drifting from the root `Design.md`.

---

## Decision

We eliminated all external web font dependencies, standardized on 13 standalone SVG icon components, established a unified dual-scope variable model in `src/styles.css`, and consolidated the repository's design documentation.

### 1. Adopt Zero-Dependency Native System Font Stacks

All `@fontsource/*` dependencies were uninstalled from `package.json`, and `@import` font statements were removed from `src/styles.css`. We defined high-performance native system font stacks:

```css
@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
```

This guarantees instantaneous zero-latency font rendering across operating systems (Apple San Francisco, Windows Segoe UI, Android Roboto/Roboto Mono) while falling back cleanly to locally installed Inter when available.

### 2. Standalone Zero-Dependency SVG Icon Architecture

Rather than loading large icon font glyph sets or introducing third-party icon libraries, we standardized all 13 application icons as lightweight, standalone Angular SVG components under `src/app/shared/ui/icons/`:

- Component list: `app-arrow-forward-icon`, `app-auto-awesome-icon`, `app-bar-chart-icon`, `app-check-icon`, `app-cloud-upload-icon`, `app-content-copy-icon`, `app-delete-icon`, `app-download-icon`, `app-error-icon`, `app-photo-filter-icon`, `app-psychology-icon`, `app-sync-icon`, `app-terminal-icon`.
- Shared style footprint: Each component references `styleUrl: './icon.css'` which applies the global `@utility app-icon { @apply inline-flex items-center justify-center shrink-0 w-5 h-5 select-none; }` via Tailwind CSS v4.
- Automated testing: Every icon component includes dedicated unit tests verifying DOM rendering and accessibility (`aria-hidden="true"`).

### 3. Dual-Scope Variable Model (`@theme` + `:root`)

We aligned `src/styles.css` to declare all design tokens in both `@theme` (for Tailwind CSS v4 compile-time utility generation) and `:root` (for runtime standard CSS custom properties):

- **Semantic Error Tokens**: `--color-error: #ef4444;`, `--color-error-container: #ef44441a;`, `--color-error-border: #ef444433;`, `--color-error-text: #fca5a5;`.
- **Glassmorphic Surface Tokens**: `--color-surface-glass: #ffffffb3;`, `--color-surface-glass-border: #d3e4fe80;`, and corresponding dark-mode variants (`--color-surface-glass-dark: #0f172a99;`, `--color-surface-glass-border-dark: #94a3b81a;`).
- **Skeleton Tokens**: `--color-skeleton: #e2e8f0;`, `--color-skeleton-dark: #334155;`.
- **Primary Glow Shadow**: `--shadow-primary-glow: 0 4px 20px -2px #4648d414;`.

### 4. Enforce Tailwind v4 Utilities and Strict Hex Alpha Transparency

- **Clean Syntax**: Replaced arbitrary bracket syntax (`@apply bg-[var(--color-primary)]`) with native Tailwind v4 class tokens (`@apply bg-(--color-primary)`).
- **Hex Transparency**: Replaced all `rgba(r, g, b, a)` declarations with modern 6- and 8-digit hexadecimal colors (`#rrggbbaa`), ensuring standard format consistency across design specs and CSS files.

### 5. Consolidate Design Specifications into Root `Design.md`

We migrated the Image Analysis feature architecture (orchestration mermaid diagram and 4-tab control system breakdown) from `src/app/features/image-analysis/Design.md` into Section 6 of root `Design.md`, and deleted the redundant file to prevent design drift.

---

## Considered Options

### Option 1: Retain `@fontsource` & Material Symbols Webfont (Rejected)

Keeping web font packages imposes an unacceptable ~3.4 MB payload penalty for an application whose primary mission is high-performance client-side and hybrid AI inference. It also introduces potential layout shifts during initial load.

### Option 2: Third-Party Angular Icon Libraries (e.g. `lucide-angular`, `@ng-icons`) (Rejected)

While convenient, external icon packages introduce transitive dependency overhead, version upgrade friction, and bundle risks. Our 13 targeted standalone SVG components achieve 100% tree-shakeability with zero npm dependencies.

### Option 3: Zero-Dependency System Fonts, Standalone SVG Components, and Unified Tokens (Accepted)

Provides optimal performance, zero layout shift, substantial payload savings, native reactivity, and strict compliance with repository architectural invariants.

---

## Consequences

### Pros

- **Massive Payload Reduction**: Shaved over **3.4 MB** from node modules and distribution assets by dropping font files.
- **Zero CLS / FOIT**: System font stacks render instantaneously without network delay or layout reflow.
- **Strict Tree-Shaking**: Each SVG icon component is an individual standalone Angular component loaded only when its parent component is rendered.
- **Runtime & Tooling Compatibility**: The explicit `:root` block ensures design variables work transparently in browser devtools, plain CSS rules, and Angular inline style bindings.
- **Deterministic Linting**: Passes all `npm run lint` and `knip` cycle checks cleanly with 100% unit test coverage across 28 test suites.

### Cons

- **Local SVG Authoring**: Any newly added icons must be authored as standalone SVG components within `src/app/shared/ui/icons/` with accompanying test cases rather than referencing arbitrary webfont string names.
