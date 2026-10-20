# MCP Tools & Research Protocol

This document defines mandatory protocols for discovering APIs, architectures, and framework capabilities.

## Mandatory Research Priorities (Pre-Flight Discovery)

Run discovery queries _before_ proposing architecture or writing code. Never guess from training memory.

1. **Modern Web Platform & DOM (`modern-web-guidance`)**:
   - **Target**: HTML5 semantic elements (`<dialog>`, `<popover>`), DOM event lifecycles (`pointerdown`/`mousedown` + `preventDefault()` vs `blur`), modern form accessibility/attributes, and CSS container queries.
   - **Command**: `npx -y modern-web-guidance@latest search "<topic>"`
   - **Constraint**: Must be queried upfront for all UI components, forms, and browser interactions before drafting templates or event logic.

2. **Angular Questions (`angular-cli` MCP server)**:
   - **Target Version**: Angular 22.
   - **Tools to Use**:
     - `search_documentation`: Official Angular documentation search.
     - `get_best_practices`: Canonical style guide and architecture patterns.
     - `ai_tutor`: Concept explanations and migration help.
     - `run_target`: Targeted testing and builds (`target: "test"`).
   - **Constraint**: Web search is strictly forbidden for Angular framework APIs and patterns unless the MCP server explicitly fails or is unreachable.

3. **Firebase & Google Cloud Questions (`firebase-mcp-server`)**:
   - **Target Versions**: Firebase Web SDK 12.x, App Hosting, Remote Config.
   - **Tools to Use**:
     - `developerknowledge_answer_query`: Direct architectural and SDK questions.
     - `developerknowledge_search_documents`: SDK documentation lookup.
   - **Constraint**: Web search is strictly forbidden for Firebase SDK and configuration questions unless the MCP server fails.

4. **General Third-Party Tools**:
   - Web search is permitted ONLY for tools and libraries without dedicated CLI/MCPs (e.g. Tailwind CSS v4, Vitest, CSpell).
