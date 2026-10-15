import { defineConfig } from 'vitepress';
import { markdownHtmlEscape } from '@binarynoir/vitepress-html-escape';
import { markdownTextStyle } from '../../../../src/index.js';

// A small site with the plugins a real BinaryNoir docs site runs, so the build
// test checks them together. VitePress 2 renders with `md.renderAsync`, so a
// plugin that only hooked `md.render` would be skipped here.
export default defineConfig({
  title: 'text-style fixture',
  markdown: {
    config(md) {
      md.use(markdownTextStyle);
      md.use(markdownHtmlEscape);
    },
  },
});
