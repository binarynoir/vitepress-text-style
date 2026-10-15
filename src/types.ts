export interface TextStyleOptions {
  /**
   * A class added to every styled `<span>`, for theme CSS that should apply
   * to all of them, such as a dark-mode adjustment. Default: none.
   */
  className?: string;
}

/**
 * What a page can put under `textStyle` in its frontmatter: `false` turns the
 * plugin off for that page, so `[t:…]` is shown as written.
 */
export type TextStyleFrontmatter = false;
