import { COLOR_FUNCTIONS, FONT_SIZE_KEYWORDS, FONT_SIZE_UNITS } from './constants.js';

// Every pattern below admits only letters, digits and a few punctuation marks,
// never `;`, quotes or `<`, so a value can't end the declaration or the
// attribute it is written into.
const NAMED_COLOR = /^[a-z]+$/i;
const HEX_COLOR = /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i;
const FUNCTION_COLOR = new RegExp(`^(?:${COLOR_FUNCTIONS.join('|')})\\((?:[\\d.%\\s,/+-]|deg|turn|rad|none)+\\)$`, 'i');
const CSS_VARIABLE = /^var\(--[\w-]+\)$/;
const NUMERIC_SIZE = new RegExp(`^(?:\\d+|\\d*\\.\\d+)(?:${FONT_SIZE_UNITS.join('|')})$`, 'i');
const KEYWORD_SIZE = new RegExp(`^(?:${FONT_SIZE_KEYWORDS.join('|')})$`, 'i');

/**
 * The color, cleaned up, if it is one the plugin accepts: a named color
 * (`red`, `rebeccapurple`, `currentColor`), a hex color (`#f00`, `#ff000080`),
 * a color function with numeric arguments (`rgb(255 0 0)`, `hsl(0, 100%, 50%)`)
 * or a CSS variable (`var(--vp-c-brand-1)`). Otherwise `null`.
 */
export function toColor(value: string): string | null {
  const color = value.trim();
  if (NAMED_COLOR.test(color) || HEX_COLOR.test(color) || FUNCTION_COLOR.test(color) || CSS_VARIABLE.test(color)) {
    return color;
  }
  return null;
}

/**
 * The font size, cleaned up, if it is one the plugin accepts: a number with a
 * unit (`24pt`, `1.2em`, `150%`), a keyword (`small`, `x-large`) or a CSS
 * variable. Otherwise `null`.
 */
export function toFontSize(value: string): string | null {
  const size = value.trim();
  if (NUMERIC_SIZE.test(size) || KEYWORD_SIZE.test(size) || CSS_VARIABLE.test(size)) return size;
  return null;
}

/**
 * The inline style for a `[t:color:size]` marker, such as
 * `color: red; font-size: 24pt;`. Either part may be empty. Returns `null`
 * when neither part is valid, so the marker is shown as written. A valid part
 * is kept even if the other is not.
 */
export function toStyle(color: string, fontSize: string): string | null {
  const declarations: string[] = [];
  const validColor = color.trim() ? toColor(color) : null;
  const validFontSize = fontSize.trim() ? toFontSize(fontSize) : null;
  if (validColor) declarations.push(`color: ${validColor};`);
  if (validFontSize) declarations.push(`font-size: ${validFontSize};`);
  return declarations.length > 0 ? declarations.join(' ') : null;
}
