# 0029. Zero-Dependency Bundle Analysis and Post-Build Inspection

Date: 2026-10-14
Status: Accepted

## Context

1. **Bundle Regression & Barrel Leak Visibility**:
   - Accidental imports (e.g. importing from domain barrels like `src/app/core/firebase` in root routing files) can pull heavy SDKs (`@firebase/ai`, `jsonrepair`) and components into the initial `main` chunk, degrading First Contentful Paint (FCP) and Time to Interactive (TTI).
   - Diagnosing esbuild metafiles (`dist/**/browser-stats.json`) previously required ad-hoc Node one-liners to inspect `stats.outputs` and `stats.inputs`.

2. **Local Workflow & Automated App Hosting Deployment**:
   - Deployment to Firebase App Hosting is automated on `git push` without standalone CI/CD pipelines.
   - The developer manually runs `npm run build` to verify main bundle size prior to pushing.
   - Adding rigid ESLint rules or lowering Angular build budgets creates unnecessary development friction. Instead, bundle inspection and leak detection should integrate seamlessly into the manual build workflow.

3. **Stats Staleness & Redundant Scripts**:
   - Running `ng build` previously did not emit stats unless explicitly invoked via `npm run build:stats`. Because `--configuration=production` is already the default configuration in `angular.json`, a separate `build:stats` script is redundant if production builds consistently generate stats.

## Decision

1. **Dedicated Zero-Dependency ESM Bundle Analyzer**:
   - Implement `scripts/analyze-bundle.mjs` using native Node.js ESM (`node:fs`, `node:path`, `node:child_process`) to parse the esbuild metafile from `dist/ng-firebase-image-analyzer/browser-stats.json`.
   - Output structured terminal summaries detailing:
     - Output chunks sorted by byte size.
     - Top input module contributors for `main-*.js`.
     - Grouped package breakdown (`@angular/*`, `firebase/*`, `app`, etc.).
     - Soft leak detection warnings if non-core packages (e.g. `@firebase/ai`, `jsonrepair`) or feature components are bundled into `main` (informative warnings, non-blocking).

2. **Automated Rebuild on Missing or Stale Stats**:
   - If `browser-stats.json` does not exist, `scripts/analyze-bundle.mjs` automatically executes `npm run build` via child process with inherited stdio before analyzing.
   - If `browser-stats.json` exists but source files under `src/` have a newer modification timestamp (`mtime`), the script automatically re-runs `npm run build` to guarantee fresh, authoritative stats.
   - Support a manual override flag `--rebuild` (or `-r`) to force a clean build regardless of file timestamps.

3. **NPM Lifecycle Hook Integration (`postbuild`)**:
   - Update `package.json` scripts:
     - `"build": "ng build --stats-json"`
     - `"postbuild": "node scripts/analyze-bundle.mjs"`
     - `"analyze:bundle": "node scripts/analyze-bundle.mjs"`
     - Remove redundant `"build:stats"`.
   - Running `npm run build` compiles production assets with stats and immediately invokes `postbuild` to display chunk sizes, main bundle breakdown, and soft leak warnings.
   - Running `npm run analyze:bundle` standalone provides fast inspection of existing stats (~100ms) while self-healing if files are missing or stale.

## Consequences

- **Positive**:
  - Seamless developer experience: running the familiar `npm run build` automatically displays the full bundle breakdown and catches leaks with zero extra commands.
  - Eliminates rigid linter rules and avoids brittle budget failures while maintaining clear visibility over bundle regressions.
  - Removes redundant `build:stats` script in favor of unified `build` and `postbuild` lifecycle.
  - Guarantees stats are never stale without forcing unconditional rebuilds on fast standalone inspections.
- **Negative**:
  - `ng build` generates `browser-stats.json` on every build run, slightly increasing build artifact size in `dist/`.
