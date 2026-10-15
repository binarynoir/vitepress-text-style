/** Frontmatter key a page uses to turn text styling off. */
export const FRONTMATTER_KEY = 'textStyle';

/** Units a numeric font size may use: `24pt`, `1.2em`, `150%`. */
export const FONT_SIZE_UNITS = [
  'px',
  'pt',
  'pc',
  'em',
  'rem',
  'ex',
  'ch',
  '%',
  'vh',
  'vw',
  'vmin',
  'vmax',
  'cm',
  'mm',
  'q',
  'in',
] as const;

/** CSS font size keywords: `small`, `x-large`, `larger`. */
export const FONT_SIZE_KEYWORDS = [
  'xx-small',
  'x-small',
  'small',
  'medium',
  'large',
  'x-large',
  'xx-large',
  'xxx-large',
  'smaller',
  'larger',
] as const;

/** CSS color functions accepted with numeric arguments: `rgb(255 0 0)`, `hsl(0, 100%, 50%)`. */
export const COLOR_FUNCTIONS = ['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch'] as const;
