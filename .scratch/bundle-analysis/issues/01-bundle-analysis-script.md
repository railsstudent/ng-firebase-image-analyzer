# 01: Dedicated Bundle Analysis Script

**What to build:** Implement a zero-dependency ESM CLI utility in `scripts/analyze-bundle.mjs` that parses `dist/ng-firebase-image-analyzer/browser-stats.json`, outputs chunk size breakdowns and top contributors, provides soft warnings for leaked dependencies in `main`, auto-rebuilds when stats are missing or stale, and integrates into `package.json` via `postbuild`. See [ADR 0029](../../../docs/adr/0029-zero-dependency-bundle-analysis-and-staleness-detection.md).

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Create `scripts/analyze-bundle.mjs` using native Node ESM (`node:fs`, `node:path`, `node:child_process`).
- [x] Implement stats verification & auto-rebuild handling:
  - If `browser-stats.json` is missing: log notification and auto-invoke `npm run build` via child process with inherited stdio.
  - If `browser-stats.json` exists but files in `src/` have a newer `mtime`: auto-invoke `npm run build` to refresh stats.
  - Support `--rebuild` (or `-r`) flag to force a fresh `npm run build`.
- [x] Format terminal output:
  - Output chunks sorted by byte size (display top 8 JS and CSS chunks, aggregate remainder).
  - Detailed breakdown of `main-*.js` sorted by input size (`printMainTopInputs`: display top 8 contributors, sum and aggregate remaining entries).
  - Grouped breakdown of `main-*.js` by package/directory (`printGroupedBreakdown`: display top 8 groups, sum and aggregate remaining entries).
  - Soft leak detection warnings (non-blocking alert if `@firebase/ai`, `jsonrepair`, or non-landing `features/*` appear in `main-*.js`).
- [x] Update `package.json` scripts:
  - Update `"build"`: `"ng build --stats-json"`.
  - Add `"postbuild"`: `"node scripts/analyze-bundle.mjs"`.
  - Add `"analyze:bundle"`: `"node scripts/analyze-bundle.mjs"`.
  - Remove redundant `"build:stats"`.
- [x] Verify script runs successfully via `npm run build` (auto-running `postbuild`) and standalone via `npm run analyze:bundle`, passing all linting/formatting checks (`npm run lint`).
