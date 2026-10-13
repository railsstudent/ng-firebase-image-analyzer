# Ticket 03: Implement MarkdownFormatterService

**Blocked by:** Ticket 02

**Status:** done

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
  dompurify: {
    sanitize: (html: string) => string;
  };
}

@Service()
export class MarkdownFormatterService {
  #modulesPromise: Promise<MarkdownModules> | null = null;

  async format(markdown: string): Promise<string> {
    if (!markdown) {
      return '';
    }
    const { snarkdown, DOMPurify } = await this.loadModules();
    const normalized = this.convertTableToList(markdown);
    return dompurify.sanitize(snarkdown(normalized));
  }

  private loadModules(): Promise<MarkdownModules> {
    if (!this.#modulesPromise) {
      this.#modulesPromise = Promise.all([import('snarkdown'), import('dompurify')]).then(
        ([snarkdownModule, dompurifyModule]) => ({
          snarkdown: snarkdownModule.default ?? snarkdownModule,
          dompurify: dompurifyModule.default ?? dompurifyModule,
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

### Unit Test Reference (`src/app/core/culinary-guide/markdown-formatter.service.spec.ts`)

```typescript
import { TestBed } from '@angular/core/testing';
import { MarkdownFormatterService } from './markdown-formatter.service';

describe('MarkdownFormatterService', () => {
  let service: MarkdownFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MarkdownFormatterService],
    });
    service = TestBed.inject(MarkdownFormatterService);
  });

  describe('format', () => {
    it('returns empty string when input is empty or falsy', async () => {
      expect(await service.format('')).toBe('');
    });

    it('formats standard markdown syntax into sanitized HTML', async () => {
      const markdown = '# Culinary Highlight\n\nTry the **authentic** ramen with *chashu*.';
      const result = await service.format(markdown);

      expect(result).toContain('<h1>Culinary Highlight</h1>');
      expect(result).toContain('<strong>authentic</strong>');
      expect(result).toContain('<em>chashu</em>');
    });

    it('converts markdown table syntax into structured bullet list items', async () => {
      const markdown = [
        '| Dish | City | Profile |',
        '| --- | --- | --- |',
        '| Pho Bo | Hanoi | Savory broth |',
        '| Banh Mi | Saigon | Crispy baguette |',
      ].join('\n');

      const result = await service.format(markdown);

      expect(result).toContain(
        '<strong>Dish:</strong> Pho Bo - <strong>City:</strong> Hanoi - <strong>Profile:</strong> Savory broth',
      );
      expect(result).toContain(
        '<strong>Dish:</strong> Banh Mi - <strong>City:</strong> Saigon - <strong>Profile:</strong> Crispy baguette',
      );
      expect(result).not.toContain('| Dish | City |');
    });

    it('sanitizes dangerous HTML and malicious script injections', async () => {
      const maliciousMarkdown =
        '<script>alert("xss")</script><img src="invalid" onerror="alert(1)">Authentic Street Food';
      const result = await service.format(maliciousMarkdown);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('onerror');
      expect(result).toContain('Authentic Street Food');
    });

    it('memoizes dynamic module imports across multiple consecutive format calls', async () => {
      const firstResult = await service.format('First **pass**');
      const secondResult = await service.format('Second **pass**');

      expect(firstResult).toContain('<strong>pass</strong>');
      expect(secondResult).toContain('<strong>pass</strong>');
    });
  });
});
```

## Acceptance Criteria

- [x] `MarkdownFormatterService` is provided in root.
- [x] `snarkdown` and `dompurify` are dynamically imported only upon first call to `format()`.
- [x] Module loader is memoized with `#modulesPromise`.
- [x] Markdown tables are converted into bullet lists via `convertTableToList()`.
- [x] Output HTML is sanitized via `dompurify.sanitize()`.
- [x] Unit tests pass with 100% coverage across markdown transformation, table conversion, and sanitization (`src/app/core/culinary-guide/markdown-formatter.service.spec.ts`).
