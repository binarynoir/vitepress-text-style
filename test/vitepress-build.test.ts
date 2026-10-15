import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vitepress';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Builds test/fixtures/site with the real `vitepress build`, alongside
// vitepress-html-escape.
const siteRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/site');
const outDir = mkdtempSync(path.join(tmpdir(), 'vitepress-text-style-'));

/** The whole page, and its body between the h1 and the end of <main>. */
function readPage(page: string): { html: string; body: string } {
  const html = readFileSync(path.join(outDir, `${page}.html`), 'utf-8');
  return { html, body: html.slice(html.indexOf('<h1'), html.indexOf('</main>')) };
}

beforeAll(async () => {
  await build(siteRoot, { outDir });
}, 120_000);

afterAll(() => {
  rmSync(outDir, { recursive: true, force: true });
  rmSync(path.join(siteRoot, '.vitepress/cache'), { recursive: true, force: true });
});

describe('vitepress build', () => {
  describe('index page', () => {
    let page = { html: '', body: '' };
    beforeAll(() => {
      page = readPage('index');
    });

    it('styles text by color, size, or both', () => {
      expect(page.body).toContain('A <span style="color:red;">red</span> word');
      expect(page.body).toContain('<span style="color:blue;font-size:24pt;">big blue</span>');
      expect(page.body).toContain('<span style="font-size:small;">small</span>');
    });

    it('accepts a theme CSS variable', () => {
      expect(page.body).toContain('<span style="color:var(--vp-c-brand-1);">brand</span>');
    });

    it('nests spans and parses Markdown inside them', () => {
      expect(page.body).toContain(
        '<span style="color:red;">outer <span style="font-size:2em;">inner</span> outer</span>',
      );
      expect(page.body).toContain('<span style="color:green;"><strong>bold</strong> and <code>code</code></span>');
    });

    it('runs alongside html-escape', () => {
      expect(page.body).toContain('<span style="color:red;">Array&lt;string&gt;</span>');
    });

    it('leaves code and invalid markers as written', () => {
      expect(page.body).toContain('<code>[t:red]inline[/t]</code>');
      expect(page.body).toContain('fenced');
      expect(page.body).not.toContain('<span style="color:red;">fenced');
      expect(page.body).toContain('[t:notacolor!]text[/t]');
    });

    it('keeps the markers out of the page title', () => {
      expect(page.html).toMatch(/<title>Styled title \| text-style fixture<\/title>/);
    });
  });

  it('is turned off by textStyle: false in frontmatter', () => {
    expect(readPage('disabled').body).toContain('Shown as written: [t:red]text[/t].');
  });
});
