import type { MarkdownIt, StateInline } from 'markdown-it';
import { FRONTMATTER_KEY } from './constants.js';
import { toStyle } from './style.js';
import type { TextStyleOptions } from './types.js';

// `[t:color]`, `[t:color:size]` or `[t::size]`, matched where the rule starts.
const OPENER = /\[t:([^:\]]*)(?::([^\]]*))?\]/y;
const CLOSER = '[/t]';
const BACKTICKS = /`+/y;
const WHITESPACE = /\s/;

/**
 * A markdown-it plugin that styles text written as `[t:color:size]text[/t]`.
 *
 * ```ts
 * import MarkdownIt from 'markdown-it';
 * import { markdownTextStyle } from '@binarynoir/vitepress-text-style';
 *
 * const md = new MarkdownIt().use(markdownTextStyle);
 * md.render('[t:red:24pt]Hello[/t]');
 * // <p><span style="color: red; font-size: 24pt;">Hello</span></p>
 * ```
 *
 * It is an inline rule, so code spans and code blocks never reach it, and the
 * text inside is parsed as Markdown: emphasis, links, inline code and other
 * `[t:…]` spans all work. Values that aren't a recognised color or size are
 * dropped; a marker with nothing valid left is shown as written.
 *
 * A page turns it off with `textStyle: false` in its frontmatter. That needs
 * VitePress's `env.frontmatter`, so under plain markdown-it it is always on.
 */
export function markdownTextStyle(md: MarkdownIt, options: TextStyleOptions = {}): void {
  // Before `link`, which would otherwise read `[t:red]` as a link label.
  md.inline.ruler.before('link', 'text_style', (state: StateInline, silent: boolean) => {
    if (state.src.charCodeAt(state.pos) !== 0x5b /* [ */) return false;
    if (isDisabled(state.env)) return false;

    OPENER.lastIndex = state.pos;
    const opener = OPENER.exec(state.src);
    const openerEnd = OPENER.lastIndex;
    if (!opener || openerEnd > state.posMax) return false;
    const style = toStyle(opener[1], opener[2] ?? '');
    if (!style) return false;

    const closerStart = findCloser(state.src, openerEnd, state.posMax);
    if (closerStart < 0) return false;
    let contentStart = openerEnd;
    let contentEnd = closerStart;
    while (contentStart < contentEnd && WHITESPACE.test(state.src[contentStart])) contentStart++;
    while (contentEnd > contentStart && WHITESPACE.test(state.src[contentEnd - 1])) contentEnd--;
    if (contentStart === contentEnd) return false;

    if (!silent) {
      const open = state.push('text_style_open', 'span', 1);
      open.markup = opener[0];
      open.attrs = options.className ? [['class', options.className]] : [];
      open.attrs.push(['style', style]);

      // Parse the content as Markdown in place, the way markdown-it's own link rule does.
      const posMax = state.posMax;
      state.pos = contentStart;
      state.posMax = contentEnd;
      state.md.inline.tokenize(state);
      state.posMax = posMax;

      state.push('text_style_close', 'span', -1).markup = CLOSER;
    }
    state.pos = closerStart + CLOSER.length;
    return true;
  });
}

/**
 * Where the `[/t]` that closes a span starting at `start` begins, or -1.
 * Nested `[t:…]` openers are counted so each closer pairs with its own
 * opener, and code spans and backslash escapes are skipped, so a `[/t]`
 * written in backticks is never taken for a closer.
 */
export function findCloser(src: string, start: number, max: number): number {
  let depth = 1;
  let pos = start;
  while (pos < max) {
    const char = src[pos];
    if (char === '\\') {
      pos += 2;
    } else if (char === '`') {
      pos = skipCodeSpan(src, pos, max);
    } else if (src.startsWith(CLOSER, pos) && pos + CLOSER.length <= max) {
      if (--depth === 0) return pos;
      pos += CLOSER.length;
    } else if (char === '[' && matchesOpener(src, pos, max)) {
      depth++;
      pos = OPENER.lastIndex;
    } else {
      pos++;
    }
  }
  return -1;
}

function matchesOpener(src: string, pos: number, max: number): boolean {
  OPENER.lastIndex = pos;
  return OPENER.test(src) && OPENER.lastIndex <= max;
}

/**
 * The position after the code span whose opening backticks start at `pos`.
 * A run of backticks with no closing run of the same length is plain text,
 * as in CommonMark, so only the run itself is skipped.
 */
function skipCodeSpan(src: string, pos: number, max: number): number {
  BACKTICKS.lastIndex = pos;
  const openLength = BACKTICKS.exec(src)![0].length;
  let search = pos + openLength;
  while (search < max) {
    const next = src.indexOf('`', search);
    if (next < 0 || next >= max) break;
    BACKTICKS.lastIndex = next;
    const closeLength = BACKTICKS.exec(src)![0].length;
    if (closeLength === openLength && next + closeLength <= max) return next + closeLength;
    search = next + closeLength;
  }
  return pos + openLength;
}

function isDisabled(env: unknown): boolean {
  const frontmatter = (env as { frontmatter?: unknown } | undefined)?.frontmatter;
  return typeof frontmatter === 'object' && frontmatter !== null && Reflect.get(frontmatter, FRONTMATTER_KEY) === false;
}
