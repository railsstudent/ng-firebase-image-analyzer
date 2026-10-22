# MCP Tools & Research Protocol

This document defines mandatory protocols and the fallback hierarchy for discovering APIs, architectures, and framework capabilities.

## Mandatory Research Priorities (Pre-Flight Discovery & `/grill-with-docs` Fact-Finding)

Run discovery queries _before_ proposing UI/architecture options in `/grill-with-docs`, answering framework/DOM questions, or writing code. Never guess from training memory, and always use built-in file-reading tools (`read_file`, `grep_search`) rather than spawning `node -e "fs..."` shell scripts.

When looking up platform or framework facts, follow this **3-Tier Resolution Ladder**:

1. **Tier 1 — Dedicated MCP Servers & CLI Discovery Tools (Primary)**:
   - **Modern Web Platform, UI, Accessibility & CLS (`modern-web-guidance`)**:
     - **Target**: HTML5 semantic elements (`<dialog>`, `<popover>`), DOM event lifecycles (`pointerdown`/`mousedown` + `preventDefault()` vs `blur`), modern form accessibility/ARIA live regions, CLS/layout stability, and CSS container queries.
     - **Command**: `npx -y modern-web-guidance@latest search "<topic>"` (works with or without the global skill installed).
     - **Rule**: Query upfront for all UI components, layout slots, forms, accessibility, and browser interactions before proposing options in `/grill-with-docs` or drafting templates/event logic.
   - **Angular Questions (`angular-cli` MCP server)**:
     - **Target Version**: Angular 22.
     - **Tools to Use**: `search_documentation` (lifecycle hooks like `afterNextRender`, signals, DI, template syntax), `get_best_practices`, `ai_tutor`, and `run_target` (`target: "test"`).
   - **Firebase & Google Cloud Questions (`firebase-mcp-server`)**:
     - **Target Versions**: Firebase Web SDK 12.x, App Hosting, Remote Config.
     - **Tools to Use**: `developerknowledge_answer_query` and `developerknowledge_search_documents`.

2. **Tier 2 — Repo-Bundled Skills & Installed `.d.ts` Contracts (When MCP is Unavailable in a Fork or Prose Docs Omit Type Overloads)**:
   - If an MCP server is not configured in the environment (e.g. a forked repo) or Tier 1 documentation does not specify an exact TypeScript overload signature:
     - First consult the repo-bundled skills in `.agents/skills/angular-developer/` and `.agents/skills/firebase-*-basics/`.
     - Next, inspect the exact installed TypeScript definitions in `node_modules/@angular/**/*.d.ts` or `node_modules/firebase/**/*.d.ts` using built-in `read_file` / `grep_search` tools.

3. **Tier 3 — Official Documentation Web Search (Last Resort & Non-MCP Libraries)**:
   - Use web search for third-party tools without dedicated CLI/MCPs (e.g. Tailwind CSS v4, Vitest, CSpell), or as a final fallback when Tiers 1 and 2 cannot answer the question.
