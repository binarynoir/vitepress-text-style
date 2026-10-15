import MarkdownIt from 'markdown-it';
import { describe, expect, it, vi } from 'vitest';
import { withTextStyle } from '../src/vitepress.js';
import type { UserConfig } from 'vitepress';

// VitePress 2 types `markdown.config` against `markdown-it-async`'s MarkdownIt,
// a structural superset of plain markdown-it's. A real `markdown-it` instance
// is fine at runtime, so this helper just bridges the two types.
type Md = InstanceType<typeof MarkdownIt>;

function runMarkdownConfig(config: UserConfig, md: Md): void {
  (config.markdown!.config as unknown as (md: Md) => void)(md);
}

describe('withTextStyle', () => {
  it('adds a markdown.config when the input config has none', () => {
    const config = withTextStyle({} as UserConfig);
    const md = new MarkdownIt();
    runMarkdownConfig(config, md);
    expect(md.render('[t:red]x[/t]')).toContain('<span style="color: red;">x</span>');
  });

  it('does not replace an existing markdown.config: it still runs, with the same md', () => {
    const userConfig = vi.fn();
    const config = withTextStyle({ markdown: { config: userConfig } } as unknown as UserConfig);
    const md = new MarkdownIt();
    runMarkdownConfig(config, md);

    expect(userConfig).toHaveBeenCalledTimes(1);
    expect(userConfig).toHaveBeenCalledWith(md);
    expect(md.render('[t:red]x[/t]')).toContain('<span style="color: red;">x</span>');
  });

  it('installs the plugin before the existing config runs', () => {
    let renderedInsideUserConfig = '';
    const config = withTextStyle({
      markdown: {
        config: (instance: Md) => {
          renderedInsideUserConfig = instance.render('[t:red]x[/t]');
        },
      },
    } as unknown as UserConfig);
    runMarkdownConfig(config, new MarkdownIt());
    expect(renderedInsideUserConfig).toContain('<span style="color: red;">x</span>');
  });

  it('passes options through to the plugin', () => {
    const config = withTextStyle({} as UserConfig, { className: 'styled' });
    const md = new MarkdownIt();
    runMarkdownConfig(config, md);
    expect(md.render('[t:red]x[/t]')).toContain('<span class="styled" style="color: red;">x</span>');
  });

  it('preserves other markdown options', () => {
    const config = withTextStyle({ markdown: { lineNumbers: true } } as UserConfig);
    expect(config.markdown?.lineNumbers).toBe(true);
  });

  it('returns the same config object', () => {
    const input = {} as UserConfig;
    expect(withTextStyle(input)).toBe(input);
  });
});
