import path from 'node:path';
import fsPromise from 'node:fs/promises';
import purgeCss from '@fullhuman/postcss-purgecss';
import { compile, optimize } from '@tailwindcss/node';
import { Scanner } from '@tailwindcss/oxide';
import { glob } from 'fast-glob';
import postcss from 'postcss';
import * as sass from 'sass';
import { currentContext, type ListNodesFull } from '../../current-context';
import { fixedConfig } from '../../fixed-config';
import { distributionPackagePath } from '../../tools/node-utils';

const forcedIncludeInternal = currentContext.config.builder.tailwind.forcedClassesInclusion;

const allClassesIncluded = [...forcedIncludeInternal, ...forcedIncludeInternal.map((item) => `${item}!`)];

/**
 * Tailwind v4 wraps all of its output in named CSS cascade layers (`@layer
 * theme|base|components|utilities`). Per the cascade layers spec, ANY unlayered
 * CSS on the page beats ANY layered CSS, regardless of specificity — and the
 * Node-RED admin UI's own CSS (red-ui-*, jQuery UI, etc.) is not layered. That
 * silently broke utilities toggled dynamically via jQuery (e.g. `.hidden`, a
 * class this package deliberately force-includes for exactly that use case):
 * `.hidden{display:none}` was present in the output and applied to the right
 * element, but structurally lost to Node-RED's own unlayered styles. v3 never
 * had this problem since it never used cascade layers at all. Unwrapping every
 * `@layer` restores v3-equivalent, plain specificity-based cascade behavior.
 */
const unwrapCascadeLayersPlugin: postcss.Plugin = {
  postcssPlugin: 'unwrap-tailwind-cascade-layers',
  Once(root) {
    root.walkAtRules('layer', (atRule) => {
      if (atRule.nodes === undefined) {
        // bare `@layer name, name, ...;` order statement — meaningless once unwrapped.
        atRule.remove();
        return;
      }
      atRule.replaceWith(...atRule.nodes);
    });
  },
};

/**
 * Tailwind v4 emits its design tokens (--spacing, --color-*, etc.) as CSS custom
 * properties on `:root, :host`. The whole compiled stylesheet gets nested inside
 * `.${packageNameSlug}{...}` (see getSrcWrapper) for isolation from other
 * Node-RED node packages, so a literal `:root`/`:host` selector would be
 * unreachable there (`.pkg :root` can never match anything), silently dropping
 * every utility that depends on those variables (e.g. margins using
 * calc(var(--spacing) * n)). Fix: rewrite the selector to the package's own scope
 * class, which the rendered HTML actually wraps its editor markup in (see
 * html.ts's `<div class="${slug}">`), and hoist the rule to the top level (kept
 * nested, it would become a no-op `.pkg .pkg{...}` descendant selector).
 *
 * Must run on the final, already-wrapped CSS string (not on the raw Tailwind
 * output before wrapping) — an earlier version rewrote this to `&` inside
 * generateCSSFromHTMLWithTailwind, but Lightning CSS's optimize() step mangles a
 * parentless `&` into `:scope` (just as unreachable without a real `@scope`
 * block) since at that point there's no real enclosing rule yet.
 */
const scopeThemeSelectorsPlugin: postcss.Plugin = {
  postcssPlugin: 'scope-tailwind-theme-selectors',
  Once(root) {
    const scopeSelector = `.${currentContext.packageNameSlug}`;
    const hoisted: import('postcss').Rule[] = [];

    root.walkRules((rule) => {
      const selectors = rule.selectors.map((selector) => selector.trim());
      if (selectors.length && selectors.every((selector) => selector === ':root' || selector === ':host')) {
        rule.selector = scopeSelector;
        hoisted.push(rule);
      }
    });

    for (const rule of hoisted) {
      rule.remove();
    }
    root.append(...hoisted);
  },
};

async function scopeThemeSelectors(css: string): Promise<string> {
  const result = await postcss([unwrapCascadeLayersPlugin, scopeThemeSelectorsPlugin]).process(css, {
    from: undefined,
  });
  return result.css;
}

/**
 * Tailwind v4's preflight resets `border-radius` to 0 on form controls
 * (button/input/select/optgroup/textarea/::file-selector-button) — v3's preflight
 * never touched border-radius at all. Once unwrapped from its cascade layer (see
 * unwrapCascadeLayersPlugin), this rule has enough priority to zero out Node-RED's
 * own default input/select border-radius, which v3 never affected. Strip just
 * this declaration from these specific preflight-generated rules, matched by
 * their exact (still-unwrapped, unprefixed) selector, so it doesn't touch
 * unrelated intentional border-radius usage (e.g. our own `.alert` or a
 * consumer's `rounded-none` utility).
 */
const FORM_CONTROL_PREFLIGHT_SELECTORS = new Set([
  'button',
  'input',
  'select',
  'optgroup',
  'textarea',
  '::file-selector-button',
]);

const restoreFormControlBorderRadiusPlugin: postcss.Plugin = {
  postcssPlugin: 'restore-form-control-border-radius',
  Once(root) {
    root.walkRules((rule) => {
      const selectors = rule.selectors.map((selector) => selector.trim());
      if (selectors.length && selectors.every((selector) => FORM_CONTROL_PREFLIGHT_SELECTORS.has(selector))) {
        rule.walkDecls('border-radius', (decl) => {
          decl.remove();
        });
      }
    });
  },
};

async function purgeUnusedClasses(cssString: string, usedContent: string): Promise<string> {
  const purged = await postcss([
    purgeCss({
      content: [{ raw: usedContent, extension: 'html' }],
      // purgecss's default extractor can't parse Tailwind's bracket-based arbitrary-value
      // classes (e.g. `max-w-[350px]`) — it splits on `[`/`]`, so it never recognizes the
      // full class name and would false-negative-strip it as "unused". This is the standard
      // Tailwind-compatible extractor: keep any run of non-whitespace/quote characters.
      defaultExtractor: (content) => content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [],
      safelist: [/^!/, /^\\!/, /^\\:/, /!$/, ...allClassesIncluded],
    }),
  ]).process(cssString, { from: undefined });

  return purged.css;
}

async function compileScss(filePath: string): Promise<string> {
  const result = await sass.compileAsync(filePath, { style: 'expanded' });
  return result.css;
}

async function buildStyles(files: string[]): Promise<Record<string, string>> {
  const compiled = await Promise.all(files.map(async (filePath) => [filePath, await compileScss(filePath)] as const));
  return Object.fromEntries(compiled);
}

export async function getNodesStyles(nodes: ListNodesFull) {
  const hasStyles = nodes.some((node) => node.editor.scssFiles.length);
  if (!hasStyles) {
    return [];
  }
  return Promise.all(
    nodes
      .filter((node) => node.editor.scssFiles.length)
      .map(async (node) => {
        const nodeStyles = await buildStyles(node.editor.scssFiles);
        const mergedCompiledStyles = Object.values(nodeStyles).join('');
        return {
          name: node.name,
          mergedCompiledStyles,
          scssFinal: `
        #${node.nodeIdentifier}{
          ${mergedCompiledStyles}
        }`,
        };
      }),
  );
}

export async function generateCSSFromHTMLWithTailwind(htmlString: string) {
  const tailwindMatches = await glob(
    `${distributionPackagePath}/${fixedConfig.nodes.editor.dirName}/assets/tailwind.scss`,
  );
  const tailwindScssFilePath = tailwindMatches[0];
  if (!tailwindScssFilePath) {
    return '';
  }

  const scssString = await fsPromise.readFile(tailwindScssFilePath, 'utf8');

  const compiler = await compile(scssString, {
    base: path.dirname(tailwindScssFilePath),
    onDependency: () => {},
  });

  const scanner = new Scanner({ sources: [] });
  const candidates = scanner.scanFiles([
    { content: htmlString, extension: 'html' },
    { content: allClassesIncluded.join(' '), extension: 'html' },
  ]);

  // NOTE: compiler.build() only candidate-gates dynamically generated utilities
  // (mb-4, flex, etc.) — hand-authored `@layer components` classes in
  // tailwind.scss (.alert, .dxp-form-row, hint variants, ...) are always emitted
  // in full regardless of usage, unlike Tailwind v3's JIT engine which tree-shook
  // those too. This was previously patched by running the result through
  // purgeUnusedClasses(), but purgecss's selector matching turned out to be
  // unreliable against Tailwind v4's native-CSS-nesting output in several
  // distinct ways: bracket-based arbitrary values, bare tag selectors used
  // inside a descendant chain (`.foo label`), attribute selectors
  // (`input[type="checkbox"]`), and selectors referencing classes that only
  // ever exist at runtime outside our own HTML (`html.nr-theme-dark &`) — each
  // caused real, hard-to-predict styling regressions. The ~25-30% larger CSS
  // output from shipping the full component-class library unconditionally is a
  // much safer trade-off than that class of bug, so this is intentionally left
  // unpurged.
  const built = compiler.build(candidates);

  const result = await postcss([restoreFormControlBorderRadiusPlugin]).process(built, { from: undefined });
  return result.css;
}

export async function getSrcStyles() {
  const srcStyles = currentContext.resolvedSrcPathsScss;
  if (!srcStyles.length) {
    return '';
  }
  const srcStylesCompiled = await buildStyles([...srcStyles]);
  return Object.values(srcStylesCompiled).join('');
}

type GetAllCompiledStylesParams = {
  rawHtml: string;
  minify?: boolean;
  nodes: ListNodesFull;
};

export async function getAllCompiledStyles(params: GetAllCompiledStylesParams) {
  const getSrcWrapper = (content: string) => `.${currentContext.packageNameSlug}{${content}}`;
  const { rawHtml, minify = false, nodes } = params || {};

  const [srcStyles, nodesStyles, twCss] = await Promise.all([
    getSrcStyles(),
    getNodesStyles(nodes),
    generateCSSFromHTMLWithTailwind(rawHtml),
  ]);

  const allNodesStyles = nodesStyles.map((node) => node.scssFinal).join('\n');

  const otherCss = minify
    ? await purgeUnusedClasses(`${srcStyles}${allNodesStyles}`, rawHtml)
    : `${srcStyles}${allNodesStyles}`;

  const wrapped = await scopeThemeSelectors(getSrcWrapper(`${twCss}${otherCss}`));

  // Always run through Lightning CSS, even when not minifying: it's what flattens
  // the deeply nested native CSS nesting (.pkg{ @layer components{ .foo{ label{...} } } })
  // into a form that doesn't depend on the browser's own nesting resolution for a
  // pattern this unusual (an @layer nested inside a plain style rule).
  return optimize(wrapped, { minify }).code;
}
