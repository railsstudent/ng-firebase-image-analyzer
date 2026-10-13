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
    it('returns empty string when input is empty or whitespace-only', async () => {
      expect(await service.format('')).toBe('');
      expect(await service.format('   \n\t  ')).toBe('');
    });

    it('formats standard markdown syntax into sanitized HTML', async () => {
      const markdown = '# Culinary Highlight\n\nTry the **authentic** ramen with *chashu*.';
      const result = await service.format(markdown);

      expect(result).toContain('<h1>Culinary Highlight</h1>');
      expect(result).toContain('<strong>authentic</strong>');
      expect(result).toContain('<em>chashu</em>');
    });

    it('converts markdown table syntax into structured bullet list items and omits empty cells', async () => {
      const markdown = [
        '| Ingredient | Amount | Substitute |',
        '| :--- | :---: | ---: |',
        '| Tamarind paste | 2 tbsp | Lime juice | Optional |',
        '| Fish sauce | 1 tbsp | |',
        '',
        'Simmer gently for 10 minutes.',
      ].join('\n');

      const result = await service.format(markdown);

      expect(result).toContain(
        '<strong>Ingredient:</strong> Tamarind paste - <strong>Amount:</strong> 2 tbsp - <strong>Substitute:</strong> Lime juice - Optional',
      );
      expect(result).toContain('<strong>Ingredient:</strong> Fish sauce - <strong>Amount:</strong> 1 tbsp');
      expect(result).not.toContain('<strong>Substitute:</strong> </li>');
      expect(result).not.toContain('| Ingredient |');
      expect(result).toContain('Simmer gently for 10 minutes.');
    });

    it('sanitizes dangerous HTML, style tags, and malicious javascript: links', async () => {
      const maliciousMarkdown = [
        '<script>alert("xss")</script>',
        '<style>body { display: none; }</style>',
        '<img src="invalid" onerror="alert(1)">',
        '[Secret Recipe](javascript:alert(1))',
        'Authentic Street Food',
      ].join('\n');
      const result = await service.format(maliciousMarkdown);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('<style>');
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('javascript:');
      expect(result).toContain('Authentic Street Food');
    });

    it('formats multiple consecutive recipe synthesis markdown stream chunks', async () => {
      const firstChunk = await service.format('Step 1: **Chop** the onions.');
      const secondChunk = await service.format('Step 2: *Saute* until golden.');

      expect(firstChunk).toContain('<strong>Chop</strong>');
      expect(secondChunk).toContain('<em>Saute</em>');
    });
  });
});
