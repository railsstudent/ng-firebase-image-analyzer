# Ticket 12: Define Recipe Accordion Domain and Design Specifications

**What to build:** The authoritative domain ubiquitous language in `GLOSSARY.md` and the visual design system specifications in `DESIGN.md` for the single-expansion accordion disclosure pattern, providing clear architectural guidance prior to UI implementation.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Add canonical domain term `Recipe Accordion` to `GLOSSARY.md` under Language, defining it as the single-expansion disclosure container displaying a culinary dish, responsible for lazy-triggering Stage 2 Recipe Synthesis on expansion and presenting ingredients, instructions, and per-dish token diagnostics.
- [ ] Add prohibited synonyms to the _Avoid_ list in `GLOSSARY.md`: _Collapsible card_, _dropdown recipe_, _food toggle_.
- [ ] Add **Section 7: Accordion Component System** to `DESIGN.md` documenting visual tokens and glassmorphism styling (`glass-card`, `surface-glass`, `surface-glass-border`, `rounded-2xl`).
- [ ] Document the responsive header typography in `DESIGN.md`: English title (`font-semibold text-lg text-on-surface`), native script pill badge (`font-mono text-xs px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant`), line-clamped description (`text-sm text-on-surface-variant line-clamp-2 md:line-clamp-none`), and right-aligned rotating chevron indicator (`transition-transform duration-200`).
- [ ] Document the responsive panel body layout in `DESIGN.md`: mobile single-column vertical stack vs. desktop two-column grid (ingredients sidebar and instructions), with pinned bottom diagnostics divider and max viewport height scroll boundary (`max-h-[60vh] md:max-h-[70vh] overflow-y-auto overscroll-contain`).
- [ ] Document semantic projection slots: `<accordion-header>` and `<accordion-body>`.
- [ ] Ensure no implementation code is modified in this ticket.
