# Ticket 03: Implement MarkdownFormatterService

## Status

Ready

## Context & Purpose

`snarkdown` and `dompurify` occupy ~30 KB and must not leak into the initial JavaScript bundle. `MarkdownFormatterService` lazily imports these modules on first format request, converts unsupported markdown tables into list items, parses markdown to HTML, and sanitizes the output.

## Scope of Work

1. Create `src/app/core/culinary-guide/markdown-formatter.service.ts`:
   - Memoized module loading using `#modulesPromise: Promise<MarkdownModules> | null = null`.
   - `convertTableToList(markdown: string): string` client-side fallback since `snarkdown` does not support markdown tables.
   - `async format(markdown: string): Promise<string>` converting markdown to sanitized HTML.
2. Create unit tests `src/app/core/culinary-guide/markdown-formatter.service.spec.ts`.

## Implementation Reference

```typescript
interface MarkdownModules {
  snarkdown: (markdown: string) => string;
  DOMPurify: {
    sanitize: (html: string) => string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class MarkdownFormatterService {
  #modulesPromise: Promise<MarkdownModules> | null = null;

  async format(markdown: string): Promise<string> {
    if (!markdown) {
      return '';
    }
    const { snarkdown, DOMPurify } = await this.loadModules();
    const normalized = this.convertTableToList(markdown);
    const rawHtml = snarkdown(normalized);
    return DOMPurify.sanitize(rawHtml);
  }

  private loadModules(): Promise<MarkdownModules> {
    if (!this.#modulesPromise) {
      this.#modulesPromise = Promise.all([import('snarkdown'), import('dompurify')]).then(
        ([snarkdownModule, dompurifyModule]) => ({
          snarkdown: snarkdownModule.default ?? snarkdownModule,
          DOMPurify: dompurifyModule.default ?? dompurifyModule,
        }),
      );
    }
    return this.#modulesPromise;
  }

  private convertTableToList(markdown: string): string {
    const lines = markdown.split('\n');
    const result: string[] = [];
    let inTable = false;
    let headers: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const cells = trimmed
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
        const isDelimiter = cells.every((c) => /^:?-+:?$/.test(c));

        if (isDelimiter) {
          continue;
        }

        if (!inTable) {
          inTable = true;
          headers = cells;
          continue;
        }

        const formattedRow = cells
          .map((cell, idx) => {
            const header = headers[idx] ? `**${headers[idx]}:** ` : '';
            return `${header}${cell}`;
          })
          .filter(Boolean)
          .join(' - ');

        result.push(`- ${formattedRow}`);
      } else {
        inTable = false;
        headers = [];
        result.push(line);
      }
    }
    return result.join('\n');
  }
}
```

## Acceptance Criteria

- [ ] `MarkdownFormatterService` is provided in root.
- [ ] `snarkdown` and `dompurify` are dynamically imported only upon first call to `format()`.
- [ ] Module loader is memoized with `#modulesPromise`.
- [ ] Markdown tables are converted into bullet lists via `convertTableToList()`.
- [ ] Output HTML is sanitized via `DOMPurify.sanitize()`.
- [ ] Unit tests pass with 100% coverage across markdown transformation, table conversion, and sanitization.
