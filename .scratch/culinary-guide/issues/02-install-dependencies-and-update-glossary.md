# Ticket 02: Install Dependencies and Update Glossary

**Blocked by:** None (can start immediately)

**Status:** done

## Context & Purpose

The Culinary Guide feature requires markdown formatting (`snarkdown`) and HTML sanitization (`dompurify`). Additionally, new canonical domain terms must be documented in `GLOSSARY.md`.

## Scope of Work

1. Run `npm install snarkdown dompurify` (note: `@types/dompurify` is not needed since `dompurify` includes its own TypeScript types).
2. Update `GLOSSARY.md` with:
   - **Culinary Discovery**: The Stage 1 generative query retrieving the top 6 iconic dishes and 1–2 honorable mentions for a destination.
   - **Recipe Synthesis**: The Stage 2 generative streaming of ingredients and markdown recipe for a selected dish.
   - **Honorable Mention Dishes**: 1–2 runner-up dishes returned during Culinary Discovery.
   - **Destination Dataset**: The static curated collection of countries and culinary cities loaded on-demand.

## Acceptance Criteria

- [x] `snarkdown` and `dompurify` installed in `package.json`.
- [x] No `@types/dompurify` added.
- [x] `GLOSSARY.md` updated with the 4 canonical domain terms.
