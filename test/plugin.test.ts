import MarkdownIt from 'markdown-it';
import { describe, expect, it } from 'vitest';
import { findCloser, markdownTextStyle } from '../src/plugin.js';

const render = (source: string, options?: Parameters<typeof markdownTextStyle>[1], env: Record<string, unknown> = {}) =>
  new MarkdownIt({ html: true }).use(markdownTextStyle, options).render(source, env);

describe('markdownTextStyle', () => {
  it('registers an inline rule before link', () => {
    const md = new MarkdownIt().use(markdownTextStyle);
    const rules = (md.inline.ruler as unknown as { __rules__: { name: string }[] }).__rules__.map((rule) => rule.name);
    expect(rules.indexOf('text_style')).toBe(rules.indexOf('link') - 1);
  });

  describe('syntax', () => {
    it('sets a color', () => {
      expect(render('[t:red]Hello World[/t]')).toBe('<p><span style="color: red;">Hello World</span></p>\n');
    });

    it('sets a color and a size', () => {
      expect(render('[t:red:24pt]Hello World[/t]')).toBe(
        '<p><span style="color: red; font-size: 24pt;">Hello World</span></p>\n',
      );
    });

    it('sets only a size', () => {
      expect(render('[t::16px]Hello World[/t]')).toBe('<p><span style="font-size: 16px;">Hello World</span></p>\n');
    });

    it('styles text in the middle of a sentence, several times', () => {
      expect(render('A [t:red]red[/t] and a [t:blue]blue[/t] word.')).toBe(
        '<p>A <span style="color: red;">red</span> and a <span style="color: blue;">blue</span> word.</p>\n',
      );
    });

    it('trims whitespace inside the span and around the values', () => {
      expect(render('[t: red : 2em ]  spaced  [/t]')).toBe(
        '<p><span style="color: red; font-size: 2em;">spaced</span></p>\n',
      );
    });

    it('works in headings, list items and table cells', () => {
      const html = render('# [t:red]Title[/t]\n\n- [t:blue]item[/t]\n\n| a |\n| - |\n| [t:green]cell[/t] |\n');
      expect(html).toContain('<h1><span style="color: red;">Title</span></h1>');
      expect(html).toContain('<li><span style="color: blue;">item</span></li>');
      expect(html).toContain('<td><span style="color: green;">cell</span></td>');
    });

    it('spans soft line breaks in a paragraph', () => {
      expect(render('[t:red]one\ntwo[/t]')).toBe('<p><span style="color: red;">one\ntwo</span></p>\n');
    });
  });

  describe('content', () => {
    it('parses Markdown inside the span', () => {
      expect(render('[t:red]**bold** and `code` and [a link](/x)[/t]')).toBe(
        '<p><span style="color: red;"><strong>bold</strong> and <code>code</code> and <a href="/x">a link</a></span></p>\n',
      );
    });

    it('allows square brackets inside the span', () => {
      expect(render('[t:red]array[0][/t]')).toBe('<p><span style="color: red;">array[0]</span></p>\n');
    });

    it('nests spans, pairing each closer with its own opener', () => {
      expect(render('[t:red]a [t::2em]b[/t] c[/t]')).toBe(
        '<p><span style="color: red;">a <span style="font-size: 2em;">b</span> c</span></p>\n',
      );
    });

    it('styles a link written inside the span', () => {
      expect(render('[t:red][docs](/docs)[/t]')).toBe(
        '<p><span style="color: red;"><a href="/docs">docs</a></span></p>\n',
      );
    });

    it('cannot style inside a link label: markdown-it reads it as a nested link', () => {
      expect(render('[[t:red]docs[/t]](/docs)')).toBe('<p>[<span style="color: red;">docs</span>](/docs)</p>\n');
    });

    it('does not take a [/t] in a code span for the closer', () => {
      expect(render('[t:red]write `[/t]` to close[/t]')).toBe(
        '<p><span style="color: red;">write <code>[/t]</code> to close</span></p>\n',
      );
    });

    it('does not take an escaped [/t] for the closer', () => {
      expect(render('[t:red]a \\[/t] b[/t]')).toBe('<p><span style="color: red;">a [/t] b</span></p>\n');
    });

    it('escapes HTML-significant text inside the span', () => {
      expect(new MarkdownIt().use(markdownTextStyle).render('[t:red]<b>&[/t]')).toBe(
        '<p><span style="color: red;">&lt;b&gt;&amp;</span></p>\n',
      );
    });
  });

  describe('left as written', () => {
    it('leaves code spans and code blocks alone', () => {
      expect(render('`[t:red]x[/t]`')).toBe('<p><code>[t:red]x[/t]</code></p>\n');
      expect(render('``a ` [t:red]x[/t]``')).toBe('<p><code>a ` [t:red]x[/t]</code></p>\n');
      expect(render('```\n[t:red]x[/t]\n```\n')).toBe('<pre><code>[t:red]x[/t]\n</code></pre>\n');
      expect(render('    [t:red]x[/t]\n')).toBe('<pre><code>[t:red]x[/t]\n</code></pre>\n');
    });

    it('leaves an escaped opener alone', () => {
      expect(render('\\[t:red]x[/t]')).toBe('<p>[t:red]x[/t]</p>\n');
    });

    it('leaves a span with no text alone', () => {
      expect(render('[t:red][/t]')).toBe('<p>[t:red][/t]</p>\n');
      expect(render('[t:red]   [/t]')).toBe('<p>[t:red]   [/t]</p>\n');
    });

    it('leaves an opener with no closer alone', () => {
      expect(render('[t:red]never closed')).toBe('<p>[t:red]never closed</p>\n');
    });

    it('does not pair across paragraphs', () => {
      expect(render('[t:red]one\n\ntwo[/t]')).toBe('<p>[t:red]one</p>\n<p>two[/t]</p>\n');
    });

    it('leaves a marker with no valid value alone', () => {
      expect(render('[t:notacolor!]x[/t]')).toBe('<p>[t:notacolor!]x[/t]</p>\n');
      expect(render('[t::huge]x[/t]')).toBe('<p>[t::huge]x[/t]</p>\n');
      expect(render('[t:]x[/t]')).toBe('<p>[t:]x[/t]</p>\n');
    });

    it('keeps the valid half of a marker', () => {
      expect(render('[t:red:huge]x[/t]')).toBe('<p><span style="color: red;">x</span></p>\n');
      expect(render('[t:#zz:2em]x[/t]')).toBe('<p><span style="font-size: 2em;">x</span></p>\n');
    });

    it('never lets a value break out of the style attribute', () => {
      for (const source of [
        '[t:red;background:url(x)]x[/t]',
        '[t:red" onclick="alert(1)]x[/t]',
        '[t::1em;position:fixed]x[/t]',
        '[t:rgb(0,0,0);x:url(y)]x[/t]',
      ]) {
        expect(render(source)).not.toContain('<span');
      }
    });

    it('leaves an ordinary link or reference alone', () => {
      expect(render('[text](/x) and [t](/y)')).toBe('<p><a href="/x">text</a> and <a href="/y">t</a></p>\n');
    });
  });

  describe('options', () => {
    it('adds className to every span', () => {
      expect(render('[t:red]x[/t]', { className: 'text-style' })).toBe(
        '<p><span class="text-style" style="color: red;">x</span></p>\n',
      );
    });
  });

  describe('frontmatter', () => {
    it('is turned off with textStyle: false', () => {
      expect(render('[t:red]x[/t]', {}, { frontmatter: { textStyle: false } })).toBe('<p>[t:red]x[/t]</p>\n');
    });

    it('ignores other values', () => {
      for (const textStyle of [true, 'off', 0, null, {}]) {
        expect(render('[t:red]x[/t]', {}, { frontmatter: { textStyle } })).toContain('<span');
      }
    });
  });
});

describe('findCloser', () => {
  it('returns -1 when the closer is past max', () => {
    const src = 'abc[/t]';
    expect(findCloser(src, 0, src.length)).toBe(3);
    expect(findCloser(src, 0, 5)).toBe(-1);
  });

  it('treats an unmatched backtick run as text', () => {
    expect(findCloser('a ` b[/t]', 0, 9)).toBe(5);
  });
});
