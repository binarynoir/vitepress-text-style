import { describe, expect, it } from 'vitest';
import { toColor, toFontSize, toStyle } from '../src/style.js';

describe('toColor', () => {
  it('accepts named colors', () => {
    for (const color of ['red', 'RebeccaPurple', 'currentColor', 'transparent']) expect(toColor(color)).toBe(color);
  });

  it('accepts hex colors of 3, 4, 6 and 8 digits', () => {
    for (const color of ['#f00', '#f008', '#FF0000', '#ff000080']) expect(toColor(color)).toBe(color);
    for (const color of ['#ff', '#fffff', '#ggg', 'f00']) expect(toColor(color)).toBeNull();
  });

  it('accepts color functions with numeric arguments', () => {
    for (const color of [
      'rgb(255, 0, 0)',
      'rgba(255,0,0,0.5)',
      'rgb(255 0 0 / 50%)',
      'hsl(120deg 50% 50%)',
      'hsla(120, 50%, 50%, .5)',
      'oklch(70% 0.1 200)',
    ]) {
      expect(toColor(color)).toBe(color);
    }
  });

  it('accepts CSS variables', () => {
    expect(toColor('var(--vp-c-brand-1)')).toBe('var(--vp-c-brand-1)');
  });

  it('trims surrounding whitespace', () => {
    expect(toColor('  red ')).toBe('red');
  });

  it('rejects anything that could escape the declaration', () => {
    for (const color of [
      'red;',
      'red; background: blue',
      'url(x)',
      'rgb(0,0,0);',
      'expression(alert(1))',
      'var(--x);color:red',
      '"red"',
      'red<',
      '',
    ]) {
      expect(toColor(color)).toBeNull();
    }
  });
});

describe('toFontSize', () => {
  it('accepts numbers with a unit', () => {
    for (const size of ['16px', '24pt', '1.2em', '.8rem', '150%', '5vw', '2vmin', '1Q'])
      expect(toFontSize(size)).toBe(size);
  });

  it('accepts keywords and CSS variables', () => {
    for (const size of ['small', 'X-Large', 'xxx-large', 'larger', 'var(--size-lg)'])
      expect(toFontSize(size)).toBe(size);
  });

  it('rejects unitless, negative and unknown values', () => {
    for (const size of ['16', '-2em', '1.em', 'huge', '2em;', 'calc(1em + 2px)', ''])
      expect(toFontSize(size)).toBeNull();
  });
});

describe('toStyle', () => {
  it('builds the declarations in color, size order', () => {
    expect(toStyle('red', '24pt')).toBe('color: red; font-size: 24pt;');
    expect(toStyle('red', '')).toBe('color: red;');
    expect(toStyle('', '24pt')).toBe('font-size: 24pt;');
  });

  it('drops an invalid part and returns null when nothing is valid', () => {
    expect(toStyle('red', 'huge')).toBe('color: red;');
    expect(toStyle('nope!', 'huge')).toBeNull();
    expect(toStyle('', '')).toBeNull();
  });
});
