# Ticket 01: Curate Static Destination Dataset

## Status

Ready

## Context & Purpose

To allow users to select a destination without complex geocoding or external API dependencies, create a static JSON dataset containing popular culinary travel destinations across multiple countries, with each country having up to 10 prominent culinary cities.

## Scope of Work

1. Create `src/app/core/culinary-guide/destinations.json` conforming to the flat domain package structure.
2. Ensure `resolveJsonModule: true` is enabled in `tsconfig.json` to support dynamic ESM JSON imports.
3. Curate global countries (e.g., Japan, Italy, Mexico, France, Thailand, Spain, Vietnam, China, India, USA) and their top culinary cities.
4. Ensure city and country names use standard ASCII characters (e.g., `Xian`, `Lyon`, `Oaxaca`) and are pre-sorted alphabetically (A–Z).
5. Export type contracts for `CulinaryDestination` and helper utilities for querying countries and cities.

## Acceptance Criteria

- [ ] Static destination data is placed at `src/app/core/culinary-guide/destinations.json` and contains at least 8–10 major culinary countries with up to 10 distinct cities each.
- [ ] Destination entries use clean ASCII names and are sorted alphabetically.
- [ ] Loaded asynchronously via dynamic ESM `import()` supported by `resolveJsonModule: true` in `tsconfig.json` to ensure zero initial bundle impact.
- [ ] No `@angular/common/http` or external network requests used.
