# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root, or
- **`GLOSSARY-MAP.md`** at the repo root if it exists — it points at one `GLOSSARY.md` per context. Read each one relevant to the topic.
- **`DESIGN.md`** & **`src/styles.css`** — canonical design system specification, `@theme` semantic color/surface tokens, typography scale, glassmorphic badges, and feature UI layout contracts. Read and reconcile whenever a task introduces or modifies UI states, badges, layout slots, or styling.
- **`docs/adr/`** — read ADRs that touch the area you're about to work in. In multi-context repos, also check `src/<context>/specs/` for context-scoped decisions.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo (most repos):

```text
/
├── GLOSSARY.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

Multi-context repo (presence of `GLOSSARY-MAP.md` at the root):

```text
/
├── GLOSSARY-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── GLOSSARY.md
    │   └── specs/                  ← context-specific decisions
    └── billing/
        ├── GLOSSARY.md
        └── specs/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_

## ADR Formatting & Metadata Standard

Every Architecture Decision Record in `docs/adr/` must include a standardized metadata header to preserve provenance, traceability, and temporal ordering:

```markdown
# NNNN. Title

Date: YYYY-MM-DD
Status: Accepted | Proposed | Deprecated | Superseded
Relates to: [ADR-NNNN](path/to/adr.md)
```

- **Numbering**: Four-digit zero-padded sequence (`0001`, `0029`, etc.).
- **Status Lifecycle**: Always indicate whether the decision is `Accepted`, `Proposed`, `Deprecated`, or `Superseded`.
- **Relates to**: Explicit cross-references to precursor, related, or superseded ADRs.
- **Reference Example**: See [ADR-0029](../adr/0029-internal-stream-aggregation-for-structured-generative-output.md).
