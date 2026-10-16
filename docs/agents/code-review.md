# Code Review Protocol & Diff Scope Guidelines

This document outlines repository-specific standards for running `/code-review` and evaluating diffs.

## 1. Diff Pinning & Git Boundaries

- **Single-Commit Reviews**:
  - When reviewing a specific commit (e.g. `<sha>` or `HEAD`), the comparison diff MUST be pinned strictly to:

    ```bash
    git diff <commit>~1..<commit>
    ```

  - **Prohibition on Speculative History Inspection**: Reviewers must never fall back to `git log -n 5` or compare against `HEAD~5`. The diff under review is strictly the specified commit.
- **Branch / PR Reviews**:
  - When reviewing a feature branch or pull request, compare against the merge base:

    ```bash
    git diff <base-branch>...HEAD
    ```

## 2. Source of Truth (Spec, ADR, Ticket, Conversation)

The **Spec Reviewer** verifies the diff against whichever sources of truth are provided:

- **Conversation History / Chat Directives**: When reviewing against the conversation, the user's explicit instructions, agreed implementation plans, and accepted proposals in the chat serve as the functional baseline.
  - **Omission Audit Invariant**: When no ticket or PRD exists and the review relies on conversation history, the reviewer must not only verify what was modified, but actively check whether any bug, code smell, or agreed refactor identified in the conversation was omitted from the diff without an explicit user deferral statement. Flag omissions as **`Missing Agreed Scope`**.
- **Implementation Tickets (`.scratch/**/NN-*.md`)**: Verifies discrete task checklists, API contracts, call-site blast radius updates, and acceptance criteria.
- **Product Specs (`spec.md`)**: Verifies feature-level behavior, user journeys, and functional expectations.
- **ADRs (`docs/adr/*.md`)**: Verifies architectural constraints, module depth, and system design patterns.

## 3. Scope Creep vs. Opportunistic Polish

Reviewers must distinguish between actual scope creep and valid engineering improvements:

- **Not Scope Creep**:
  - **Retrospective Documentation Updates**: Modifications to `docs/agents/*.md` or `.scratch/*.md` resulting from retrospectives are expected byproducts.
  - **Opportunistic Polish**: Minor adjacent improvements discovered during manual coding (e.g., import hygiene, explicit `import type`, type annotations, dead code cleanup, comment accuracy) are valid refinements, provided they do not break existing public contracts.
- **Actual Scope Creep**:
  - Introducing unspecified public methods, unrelated feature behaviors, or orthogonal domain changes not mentioned in the ticket, spec, ADR, or conversation.
