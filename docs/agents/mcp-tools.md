# MCP Tools & Research Protocol

This document defines mandatory protocols for discovering APIs, architectures, and framework capabilities.

## Mandatory MCP Server Priorities

Never use generic web search when dedicated MCP servers are available in the workspace:

1. **Angular Questions (`angular-cli` MCP server)**:
   - **Target Version**: Angular 22.
   - **Tools to Use**:
     - `search_documentation`: Official Angular documentation search.
     - `get_best_practices`: Canonical style guide and architecture patterns.
     - `ai_tutor`: Concept explanations and migration help.
     - `run_target`: Targeted testing and builds (`target: "test"`).
   - **Constraint**: Web search is strictly forbidden for Angular framework APIs and patterns unless the MCP server explicitly fails or is unreachable.

2. **Firebase & Google Cloud Questions (`firebase-mcp-server`)**:
   - **Target Versions**: Firebase Web SDK 12.x, App Hosting, Remote Config.
   - **Tools to Use**:
     - `developerknowledge_answer_query`: Direct architectural and SDK questions.
     - `developerknowledge_search_documents`: SDK documentation lookup.
   - **Constraint**: Web search is strictly forbidden for Firebase SDK and configuration questions unless the MCP server fails.

3. **General Third-Party Tools**:
   - Web search is permitted ONLY for tools and libraries without dedicated MCP servers (e.g. Tailwind CSS v4, Vitest, CSpell).
