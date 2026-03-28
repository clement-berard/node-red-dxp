import { describe, expect, it, vi } from 'vitest';
import { getFinalSrcPath, parseFileAttrs, wrapCssMarkup, wrapJsMarkup } from '../resources';

vi.mock('../../../current-context', () => ({
  currentContext: {
    pathResourcesDir: '/project/resources',
    packageName: 'my-package',
  },
}));

describe('parseFileAttrs', () => {
  it('returns empty attrs if no [attrs=...]', () => {
    expect(parseFileAttrs('ma-lib.js')).toEqual({ attrs: {} });
  });

  it('parses a boolean attribute', () => {
    expect(parseFileAttrs('ma-lib[attrs=defer].js')).toEqual({ attrs: { defer: true } });
  });

  it('parses an attribute with value', () => {
    expect(parseFileAttrs('ma-lib[attrs=type=module].js')).toEqual({ attrs: { type: 'module' } });
  });

  it('parses multiple attributes', () => {
    expect(parseFileAttrs('ma-lib[attrs=defer,type=module].js')).toEqual({
      attrs: { defer: true, type: 'module' },
    });
  });

  it('trims spaces around attributes', () => {
    expect(parseFileAttrs('ma-lib[attrs=defer, type=module].js')).toEqual({
      attrs: { defer: true, type: 'module' },
    });
  });
});

describe('wrapJsMarkup', () => {
  it('generates a simple script tag without attrs', () => {
    expect(wrapJsMarkup('resources/my-package/ma-lib.js')).toBe(
      '<script src="resources/my-package/ma-lib.js"></script>',
    );
  });

  it('generates a script tag with defer', () => {
    expect(wrapJsMarkup('resources/my-package/ma-lib.js', { defer: true })).toBe(
      '<script src="resources/my-package/ma-lib.js" defer></script>',
    );
  });

  it('generates a script tag with a value attribute', () => {
    expect(wrapJsMarkup('resources/my-package/ma-lib.js', { type: 'module' })).toBe(
      '<script src="resources/my-package/ma-lib.js" type="module"></script>',
    );
  });

  it('generates a script tag with multiple attrs', () => {
    expect(wrapJsMarkup('resources/my-package/ma-lib.js', { defer: true, type: 'module' })).toBe(
      '<script src="resources/my-package/ma-lib.js" defer type="module"></script>',
    );
  });
});

describe('wrapCssMarkup', () => {
  it('generates a simple link tag without attrs', () => {
    expect(wrapCssMarkup('resources/my-package/ma-lib.css')).toBe(
      '<link rel="stylesheet" href="resources/my-package/ma-lib.css">',
    );
  });

  it('generates a link tag with a value attribute', () => {
    expect(wrapCssMarkup('resources/my-package/ma-lib.css', { media: 'print' })).toBe(
      '<link rel="stylesheet" href="resources/my-package/ma-lib.css" media="print">',
    );
  });
});

describe('getFinalSrcPath', () => {
  it('removes pathResourcesDir', () => {
    expect(getFinalSrcPath('/project/resources/ma-lib.js')).toBe('resources/my-package/ma-lib.js');
  });

  it('removes [attrs=...] from filename', () => {
    expect(getFinalSrcPath('/project/resources/ma-lib[attrs=defer].js')).toBe('resources/my-package/ma-lib.js');
  });
});
