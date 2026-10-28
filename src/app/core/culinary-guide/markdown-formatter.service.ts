import { Service } from '@angular/core';
import type { MarkdownModules } from './culinary-guide.interface';

@Service()
export class MarkdownFormatterService {
  #modulesPromise: Promise<MarkdownModules> | null = null;

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
          .slice(1, trimmed.length - 1)
          .split('|')
          .map((c) => c.trim());
        const isDelimiter = cells.every((c) => /^:?-+:?$/.test(c));

        if (!isDelimiter) {
          if (!inTable) {
            inTable = true;
            headers = cells;
          } else {
            const formattedRow = cells
              .map((cell, idx) => {
                if (!cell) {
                  return '';
                }
                const header = headers[idx] ? `**${headers[idx]}:** ` : '';
                return `${header}${cell}`;
              })
              .filter(Boolean)
              .join(' - ');
            result.push(`- ${formattedRow}`);
          }
        }
      } else {
        inTable = false;
        headers = [];
        result.push(line);
      }
    }
    return result.join('\n');
  }

  async format(markdown: string): Promise<string> {
    if (!markdown.trim()) {
      return '';
    }

    const { snarkdown, dompurify } = await this.loadModules();
    const normalizedMarkdown = this.convertTableToList(markdown);
    return dompurify.sanitize(snarkdown(normalizedMarkdown));
  }
}
