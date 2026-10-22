# vitepress-text-style

[![npm version](https://img.shields.io/npm/v/@binarynoir/vitepress-text-style.svg)](https://www.npmjs.com/package/@binarynoir/vitepress-text-style)
[![CI](https://github.com/binarynoir/vitepress-text-style/actions/workflows/ci.yml/badge.svg)](https://github.com/binarynoir/vitepress-text-style/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@binarynoir/vitepress-text-style.svg)](LICENSE)

A [VitePress](https://vitepress.dev) plugin that colors and sizes text inline in
Markdown. Write `[t:red]warning[/t]` or `[t::1.2em]larger[/t]` and get a styled
`<span>`, without writing HTML. Values are checked before they reach the page,
code is left alone, and the text inside is still Markdown.

It uses the same syntax as the text-style plugin many VuePress sites carry, so
pages can move to VitePress without being rewritten.

[Documentation and live demo](https://binarynoir.tech/plugins/text-style)

[![Support me on Buy Me a Coffee](https://img.shields.io/badge/Support%20me-Buy%20Me%20a%20Coffee-orange?style=for-the-badge&logo=buy-me-a-coffee)](https://buymeacoffee.com/binarynoir)
[![Support me on Ko-fi](https://img.shields.io/badge/Support%20me-Ko--fi-blue?style=for-the-badge&logo=ko-fi)](https://ko-fi.com/binarynoir)
[![More tools](https://img.shields.io/badge/Website-binarynoir.tech-8c8c8c?style=for-the-badge)](https://binarynoir.tech)

## What this does

```md
A [t:red]red[/t] word, a [t:blue:24pt]big blue[/t] one, and a [t::small]small[/t] one.
```

renders as:

```html
<p>
  A <span style="color: red;">red</span> word, a <span style="color: blue; font-size: 24pt;">big blue</span> one, and a
  <span style="font-size: small;">small</span> one.
</p>
```

## Install

```sh
npm install @binarynoir/vitepress-text-style
```

## Usage

Register the plugin in VitePress's own `markdown.config` hook, the same place
you'd add any other markdown-it plugin:

```ts
// .vitepress/config.mts
import { defineConfig } from 'vitepress';
import { markdownTextStyle } from '@binarynoir/vitepress-text-style';

export default defineConfig({
  markdown: {
    config(md) {
      md.use(markdownTextStyle);
    },
  },
});
```

Prefer wrapping your config? `withTextStyle` does the same in one call, the
same way `withMermaid` or `withMarkdownTags` do:

```ts
import { withTextStyle } from '@binarynoir/vitepress-text-style/vitepress';

export default withTextStyle(
  defineConfig({
    // ...your normal config
  }),
);
```

`withTextStyle` will not clobber a `markdown.config` you already have,
including one set by another `withX()` wrapper. It installs its own first, then
calls yours with the same arguments.

### Plain markdown-it

```ts
import MarkdownIt from 'markdown-it';
import { markdownTextStyle } from '@binarynoir/vitepress-text-style';

const md = new MarkdownIt().use(markdownTextStyle);
```

It works with `html: false` too: the plugin emits its own tokens, not raw HTML.

## Syntax

```md
[t:color]text[/t]
[t:color:size]text[/t]
[t::size]text[/t]
```

- Either value can be left out, but not both.
- Whitespace around the values and the text is ignored: `[t: red ] text [/t]`
  is the same as `[t:red]text[/t]`.
- The text is parsed as Markdown, so `[t:red]**bold** and [a link](/x)[/t]`
  works.
- Spans nest, and each `[/t]` closes its own opener:
  `[t:red]a [t::2em]b[/t] c[/t]`.
- A span stays within one paragraph, heading, list item or table cell.
- Inline code, fenced code and indented code blocks are never styled, so you
  can show the syntax itself in backticks. A `[/t]` inside a code span or
  escaped as `\[/t]` doesn't close a span.
- To show the syntax as text outside code, escape the opener: `\[t:red]`.

## Values

**Colors**

| Form            | Examples                                                                        |
| --------------- | ------------------------------------------------------------------------------- |
| Named colors    | `red`, `rebeccapurple`, `currentColor`, `transparent`                           |
| Hex             | `#f00`, `#f008`, `#ff0000`, `#ff000080`                                         |
| Color functions | `rgb(255 0 0)`, `rgba(255,0,0,.5)`, `hsl(120deg 50% 50%)`, `oklch(70% 0.1 200)` |
| CSS variables   | `var(--vp-c-brand-1)`                                                           |

Color functions (`rgb`, `rgba`, `hsl`, `hsla`, `hwb`, `lab`, `lch`, `oklab`,
`oklch`) accept numbers, `%`, `deg`, `turn`, `rad` and `none`.

A theme variable like `var(--vp-c-brand-1)` or `var(--vp-c-danger-1)` follows
VitePress's light and dark modes, where a fixed color like `darkblue` may be
hard to read on a dark background.

**Sizes**

| Form            | Examples                                        |
| --------------- | ----------------------------------------------- |
| Number and unit | `16px`, `24pt`, `1.2em`, `.8rem`, `150%`, `5vw` |
| Keywords        | `xx-small` to `xxx-large`, `smaller`, `larger`  |
| CSS variables   | `var(--my-size)`                                |

Units: `px`, `pt`, `pc`, `em`, `rem`, `ex`, `ch`, `%`, `vh`, `vw`, `vmin`,
`vmax`, `cm`, `mm`, `q`, `in`.

**Anything else is dropped.** If one value is invalid, the other is still
applied: `[t:red:huge]x[/t]` is red at the normal size. If neither is valid,
the whole span is shown as written, so a typo is visible on the page instead
of silently doing nothing. No value can contain `;`, quotes or `<`, so a
marker can't add other CSS or break out of the `style` attribute.

## Turning it off for a page

```yaml
---
textStyle: false
---
```

On that page `[t:…]` is shown as written. This needs VitePress's
`env.frontmatter`, so under plain markdown-it the plugin is always on.

## Options

`markdownTextStyle(md, options)` and `withTextStyle(config, options)` take:

| Option      | Default | Description                                                                             |
| ----------- | ------- | --------------------------------------------------------------------------------------- |
| `className` | none    | A class added to every styled `<span>`, for theme CSS that should apply to all of them. |

## Migrating from VuePress

The syntax and output match the VuePress text-style plugin, with a few
differences:

- **Code is detected by markdown-it, not by splitting on backticks.** Indented
  code blocks and multi-backtick code spans are now left alone too.
- **The text is Markdown.** `**bold**` inside a span is bold, where it was
  passed through before. Text containing `[` (`array[0]`) now works.
- **Spans nest.**
- **More values are accepted**: 4- and 8-digit hex, modern color functions,
  CSS variables, and `vmin`, `vmax` and `q` sizes.

## Limits

- **A span can't go inside a link's text.** `[[t:red]docs[/t]](/docs)` isn't a
  link, because markdown-it doesn't allow brackets that another rule consumed
  inside a link label (the same rule that stops links inside links). Put the
  span around the link instead: `[t:red][docs](/docs)[/t]`.
- **Inline styles only.** For styling you reuse, a class in your theme CSS is
  easier to change later; `className` adds one to every span.

## API

```ts
import {
  markdownTextStyle,
  toColor,
  toFontSize,
  toStyle,
  FRONTMATTER_KEY,
  FONT_SIZE_UNITS,
  FONT_SIZE_KEYWORDS,
  COLOR_FUNCTIONS,
} from '@binarynoir/vitepress-text-style';

toColor(value: string): string | null
toFontSize(value: string): string | null
toStyle(color: string, fontSize: string): string | null
```

`toColor` and `toFontSize` return the trimmed value if the plugin accepts it,
or `null`. `toStyle` returns the `style` attribute for a marker
(`color: red; font-size: 24pt;`), or `null` when neither value is valid.

## Related projects

| Project                                                                          | What it does                                   |
| -------------------------------------------------------------------------------- | ---------------------------------------------- |
| [vitepress-markdown-tags](https://github.com/binarynoir/vitepress-markdown-tags) | Inline status tags like `((tag\|Done\|green))` |
| [vitepress-html-escape](https://github.com/binarynoir/vitepress-html-escape)     | Stray `<tags>` and `{{ }}` shown as text       |
| [markdown-it-glossary](https://github.com/binarynoir/markdown-it-glossary)       | Hover definitions for glossary terms           |

## Releasing

Releases are tag-triggered. From a clean `main` that's in sync with
`origin/main`:

```sh
npm run release:patch   # or release:minor / release:major
```

This runs typecheck/lint/test/build locally, then `npm version <bump>` and
`git push --follow-tags`. Pushing the tag triggers
[`.github/workflows/release.yml`](.github/workflows/release.yml), which re-runs
the checks, publishes to npm, and creates a GitHub release.

## License

MIT

---

## Feedback and support

Bug reports, feature requests and questions are all welcome. Please open them on this project's [GitHub issue tracker](https://github.com/binarynoir/vitepress-text-style/issues):

- **Found a bug?** [Report it](https://github.com/binarynoir/vitepress-text-style/issues/new?labels=bug&title=Bug%3A%20). Include your version and the steps to reproduce it.
- **Have an idea?** [Request a feature](https://github.com/binarynoir/vitepress-text-style/issues/new?labels=enhancement&title=Feature%20request%3A%20). Tell us what you are trying to do.
- **Something else?** [Browse open issues](https://github.com/binarynoir/vitepress-text-style/issues) to see if it has already been raised.

Pull requests are welcome too.

<!-- binarynoir:more:start (generated from binarynoir.github.io/products.json) -->

## More from BinaryNoir

<p align="center">
  <a href="https://binarynoir.tech">
    <img alt="BinaryNoir" src="https://binarynoir.tech/logo-horizontal.svg" width="320">
  </a>
</p>

Text Style is one of a family of open-source tools from BinaryNoir.

**Pairs well with Text Style**

- [Markdown Tags](https://binarynoir.tech/plugins/markdown-tags/): inline status badges and tagged-pages lists
- [Glossary Tooltips](https://binarynoir.tech/plugins/glossary/): hover definitions from one glossary file
- [Reading Time Tag](https://binarynoir.tech/plugins/reading-time-tag): reading-time estimates

**New:** [Blog](https://binarynoir.tech/plugins/blog/): posts anywhere, a main blog and section blogs, with RSS feeds

**See them all:** VitePress plugins, Vite plugins, editor extensions and command-line tools, with documentation and live demos, at **[binarynoir.tech](https://binarynoir.tech)**.

<!-- binarynoir:more:end -->

## Author

John Smith III, [BinaryNoir](https://binarynoir.tech). Thanks to all contributors and users for their support and feedback.
