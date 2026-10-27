---
trigger: model_decision
description: Concise architectural communication: explain concepts, trade-offs, boundaries, and cross-file changes using Markdown tables and short text first, always recommending the best engineering solution.
---

# Concise Architectural Communication

When explaining architecture, dependency injection tokens, component boundaries, or refactoring trade-offs:

1. **Tables & Short Text First**: Default to **Markdown tables** and **1–2 sentence takeaways** when comparing options, trade-offs, or cross-file changes. Avoid multi-paragraph prose.
2. **Best Engineering Solution First**: Always recommend the architecturally and performance/bundle-optimal solution first, regardless of how many files it touches. Never recommend a suboptimal shortcut just to minimize file edits.
3. **No Unsolicited Code Dumps**: Use brief 1-line before/after cells inside tables instead of large standalone code blocks unless the user explicitly asks for full code snippets.
4. **High Information Density**: Keep answers compact, direct, and free of conversational filler, patronizing language, or unnecessary repetition.
