# Project Context: NgFirebaseImageAnalyzer 🗺️

This document describes the high-level system context, domain concepts, ubiquitous language, and AI-assisted engineering tools used to build and maintain the **NgFirebaseImageAnalyzer** application.

---

## 🏗️ Domain Overview & Ubiquitous Language

To ensure consistency between developers and AI agents, the following terms represent the canonical vocabulary of the system:

* **Hybrid Inference**: The mechanism of automatically routing image analysis queries between client-side WebGPU execution (using Gemini Nano) and Cloud-scale Vertex AI, depending on browser capabilities and network connectivity.
* **On-Device Pre-Warming**: The background process of downloading, caching, and compiling WebGPU shaders for the Gemini Nano model during application startup to ensure zero-latency first-run inference.
* **App Check Sandbox**: A secure local development mechanism that bypasses reCAPTCHA Enterprise verification on local environments. It can run in **Transient Mode** (automatically generating and logging single-session debug tokens to the browser console) or **Locked Mode** (using a persistent, pre-registered custom debug token string defined in the local `.env` configuration).
* **Visual Enhancer**: The system component allowing users to calibrate image properties (brightness, contrast, and structure) based on the structural metadata returned by the analysis models.

---

## 🤖 AI-Assisted Development (Antigravity Ecosystem)

This project leverages context-aware developer agent skills and registered Model Context Protocol (MCP) servers under the **Antigravity CLI** (`antigravity-cli`) to automate and accelerate development.

### 🔌 Local Agent Skills (`.agents/skills/`)

The repository contains custom instructions designed to align AI assistants with the project's design standards:

* **`angular-developer`**: Enforces strict typing, Angular Signals, and functional dependency injection patterns.
* **`firebase-basics` / `firebase-firestore` / `firebase-app-hosting-basics`**: Standardizes interactions with the Firebase CLI, local emulators, and App Hosting configurations.
* **`domain-modeling`**: Monitors the boundary between core business logic and implementation, actively refining this `CONTEXT.md` glossary.
* **`grill-with-docs`**: Drives pre-implementation design interviews to resolve trade-offs before writing code.
* **`code-review`**: Conducts a rigorous, two-axis audit (comparing changes against documented Standards and Spec requirements) using parallel sub-agents to detect regression, Fowler code smells, and scope creep since a given Git reference.

### 🌐 Global MCP Server Integrations

Registered tool environments used by the development agent:

* **`angular-cli` MCP Server**: Exposes Angular build, schematic, and best-practice query tools.
* **`chrome-devtools` MCP Server**: Enables automated UI, performance, and accessibility (a11y) debugging directly from the terminal workspace.
* **`stitch` MCP Server**: Enables direct creation, variant generation, asset downloading, and system styling of premium application screens using natural language prompts.

---

## ⚙️ Global MCP Server Configuration Guides

The global Model Context Protocol (MCP) servers used by this project are machine-specific and must be registered in your global user-profile directory, **not** in this git workspace.

### Setup File Locations

Depending on your developer agent client, open the following configuration file on your local machine:

* **Antigravity CLI**: `~/.gemini/antigravity-cli/mcp_config.json`
* **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json` (on macOS)

### JSON Setup Snippet (Host-Agnostic with `npx`)

Add the following blocks inside the `"mcpServers"` parent object of your config file. These commands utilize `npx -y` to run the servers directly in a host-agnostic manner:

```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/mcp-server"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "@chrome-devtools/mcp-server"]
    },
    "stitch": {
      "command": "npx",
      "args": ["-y", "@stitch/mcp-server"],
      "env": {
        "STITCH_API_KEY": "<your-secret-stitch-api-key>",
        "STITCH_PROJECT_ID": "<your-stitch-project-id>"
      }
    }
  }
}
```
