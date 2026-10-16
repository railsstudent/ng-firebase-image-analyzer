---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

If the user passes a ticket reference, fetch it from the issue tracker and state its title before starting. If the reference is ambiguous, ask.

## Pre-authored Code & Partial Handoffs

Before writing code, inspect `git status` and the ticket acceptance criteria:

- **Preserve User Code**: If the user has already drafted or refactored parts of the code, treat their implementation as authoritative and locked. Do not rewrite, "clean up", or undo user logic.
- **Identify Outstanding Work**: Determine what remains undone to satisfy the ticket (e.g., unit tests, edge-case coverage, retry mechanisms, error handling, or wiring). Focus execution strictly on completing those missing pieces.
- **Testing Pre-authored Code**: Write comprehensive unit tests that verify the user-authored code against the ticket criteria. Do not alter working logic unless a test exposes an unhandled bug or missing requirement.

## Execution

Call the Skill tool with "tdd" where possible, at pre-agreed seams (or write tests verifying pre-authored logic).

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, call the Skill tool with "code-review" to review the work.

Leave staging and commits to the developer after validation passes (or commit if explicitly directed).
