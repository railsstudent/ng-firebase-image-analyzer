# AGENTS

This file provides context, rules, and guidance for AI assistants working on this codebase.

## Directory Navigation

- **`src/app/core/<domain>/`**: Cohesive flat domain packages (services, domain contracts `<domain>.interface.ts`) with public `index.ts`. Keep domain files at the root level of the folder without nested subdirectories.
- **`src/app/features/`**: Feature components, routing, and view models. Never create barrel files (`index.ts`) in feature folders or across `@defer` boundaries.
- **`src/app/shared/`**: Reusable UI (`ui/components/` including co-located `recommendation-list/recommendation-item.*`, `ui/icons/`, `ui/image-uploader/`, `ui/layout/{header,footer}/`), `directives/`, and `pipes/`.
- **`src/app/pwa/`**: Service worker update service and `pwa-update-banner/`.
- **`src/testing/`**: Shared mock factories (`createMock*`).
- **`firebase/`**: Firebase CLI configs (`firebase.json`, Remote Config templates, prebuild scripts).

## Context Pointers & Protocols

- **MCP Tools & Research**: [docs/agents/mcp-tools.md](docs/agents/mcp-tools.md) — Pre-flight discovery: MUST consult `modern-web-guidance` and `angular-cli`/`firebase-mcp-server` MCPs when answering framework/DOM questions, proposing UI/architecture in `/grill-with-docs`, or drafting code. Never guess platform APIs.
- **Coding Standards & Invariants**: [docs/agents/coding-standards.md](docs/agents/coding-standards.md) — Invariants enforced by `lint-staged` and `eslint.config.mjs` (zero `!`, zero `../`, native `#` for state/deps, TS `private` for methods, Signal Forms).
- **Testing & Mocking**: [docs/agents/testing-guide.md](docs/agents/testing-guide.md) — MUST consult before creating or editing any `*.spec.ts` file (including during `/tdd`). Covers TestBed boundary mocking via `satisfies Partial<T>`, `vi.waitFor` async settling, Vitest spy patterns, mock factories, and targeted runner usage. When fixing failing tests, never alter production code without explicit permission; update test setups and expectations to match the authoritative production contract.
- **Domain Modeling & Design System**: [docs/agents/domain.md](docs/agents/domain.md) — MUST consult and reconcile `DESIGN.md` and `docs/adr/0022-zero-dependency-fonts-and-design-tokens.md` whenever planning or editing `src/styles.css`, `*.component.css`, `@theme` tokens, or UI component classes, and consult `GLOSSARY.md` / `docs/adr/` for domain decisions.
- **Document Boundaries & Ticket Format**: [docs/agents/document-boundaries.md](docs/agents/document-boundaries.md) — MUST consult before authoring PRDs (`spec.md`), ADRs (`docs/adr/`), Design System (`DESIGN.md`), or human-executable implementation tickets (`.scratch/`, including during `/to-tickets`).
- **Code Review Protocols**: [docs/agents/code-review.md](docs/agents/code-review.md) — Single-commit diff pinning (`<sha>~1..<sha>`), four-tier baseline (Conversation/Ticket/Spec/ADR), and distinguishing opportunistic polish from scope creep.

## Verification Loop & Git Boundaries

1. **Targeted Testing during Development**: Use `angular-cli` MCP `run_target` with `target: "test"` against modified files or directories (or `npx ng test --include="<path>" --no-watch` if the MCP server is unavailable).
2. **End-of-Task Validation**: Run intermediate vs. integration checks as defined in [docs/agents/testing-guide.md](docs/agents/testing-guide.md) before declaring work complete.
3. **No Automatic Git Commits**: Never run `git add` or `git commit`. Leave all staging and commits to the developer after validation passes.
