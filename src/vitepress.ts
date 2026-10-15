import type { UserConfig } from 'vitepress';
import type { MarkdownIt } from 'markdown-it';
import { markdownTextStyle } from './plugin.js';
import type { TextStyleOptions } from './types.js';

/**
 * Wraps a VitePress config with text styling, the same way `withHtmlEscape`
 * from `vitepress-html-escape` does for escaping.
 *
 * ```ts
 * // .vitepress/config.mts
 * import { defineConfig } from 'vitepress';
 * import { withTextStyle } from '@binarynoir/vitepress-text-style/vitepress';
 *
 * export default withTextStyle(defineConfig({ /* ...your config... *\/ }));
 * ```
 *
 * An existing `markdown.config` is not replaced: this wrapper runs first, then
 * calls yours with the same arguments, so it composes with other `withX()`
 * wrappers in any order.
 */
export function withTextStyle(config: UserConfig, options: TextStyleOptions = {}): UserConfig {
  config.markdown ??= {};
  const existingMarkdownConfig = config.markdown.config ?? (() => {});
  config.markdown.config = (md) => {
    // VitePress 2 types this callback against `markdown-it-async`'s MarkdownIt,
    // a structural superset of plain markdown-it's; the cast bridges the two.
    markdownTextStyle(md as unknown as MarkdownIt, options);
    existingMarkdownConfig(md);
  };
  return config;
}
