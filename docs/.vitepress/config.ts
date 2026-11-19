import { existsSync, readdirSync } from 'node:fs';
import { defineConfig } from 'vitepress';
import { npmCommandsMarkdownPlugin } from 'vitepress-plugin-npm-commands';
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs';

const releaseVersion = process.env.RELEASE_VERSION || 'dev';
const buildDate = new Date().toISOString().split('T')[0];

function getGeneratedPages(dir: string, urlBase: string) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.match(/^(Function|Variable|Class|Interface)\./))
    .map((f) => ({
      text: f.replace(/^(Function|Variable|Class|Interface)\./, '').replace('.md', ''),
      link: `${urlBase}/${f.replace('.md', '')}`,
    }));
}

export default defineConfig({
  title: 'Node-RED DXP',
  description:
    'Build custom Node-RED nodes faster with Node-RED DXP. An all-in-one toolkit featuring ultra-fast esbuild, TypeScript support, and automated documentation for a superior developer experience.',
  cleanUrls: true,
  sitemap: {
    hostname: 'https://clement-berard.github.io/node-red-dxp',
  },
  base: process.env.CI ? '/node-red-dxp/' : '/',
  head: [
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en_US' }],
    ['meta', { property: 'og:site_name', content: 'Node-RED DXP - Fast TypeScript Node Builder & Toolkit' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    [
      'script',
      {
        async: '',
        src: 'https://rum.cronitor.io/script.js',
      },
    ],
    [
      'script',
      {},
      `
    window.cronitor = window.cronitor || function() { (window.cronitor.q = window.cronitor.q || []).push(arguments); };
    cronitor('config', { clientKey: 'e592c5fce8d09201cfdb55663555d8a5' });
      `,
    ],
  ],
  markdown: {
    config(md) {
      md.use(tabsMarkdownPlugin);
      md.use(npmCommandsMarkdownPlugin);
    },
  },
  themeConfig: {
    nav: [
      { text: 'Guides', link: '/guide/' },
      { text: 'Reference', link: '/svelte/' },
      { text: 'CLI', link: '/cli/create' },
    ],
    sidebar: [
      {
        text: 'Getting started',
        items: [
          { text: 'Introduction', link: '/overview' },
          { text: 'Your first node', link: '/guide/first-node' },
          { text: 'Manual setup', link: '/get-started' },
        ],
      },
      {
        text: 'Guides',
        items: [
          { text: 'Build the form', link: '/guide/form-recipes' },
          { text: 'Write the runtime', link: '/guide/runtime' },
          { text: 'Config nodes and shared settings', link: '/guide/config-node' },
          { text: 'Test and publish', link: '/guide/test-and-publish' },
          { text: 'Migrate from pug to Svelte', link: '/svelte/migration' },
        ],
      },
      {
        text: 'Svelte editor reference',
        items: [
          { text: 'Overview', link: '/svelte/' },
          { text: 'The node file', link: '/svelte/node-file' },
          { text: 'Components', link: '/svelte/components' },
          { text: 'Credentials', link: '/svelte/credentials' },
          { text: 'Help and i18n', link: '/svelte/help-and-i18n' },
          { text: 'Styling', link: '/svelte/styling' },
          { text: 'TypeScript and IDE', link: '/svelte/typescript' },
          { text: 'Troubleshooting', link: '/svelte/troubleshooting' },
        ],
      },
      {
        text: 'Project',
        items: [
          { text: 'Node documentation', link: '/documentation.md' },
          { text: 'Server-side', link: '/server-side.md' },
          { text: 'Resources', link: '/resources.md' },
          { text: 'Internationalisation', link: '/i18n.md' },
          { text: 'Configuration file', link: '/config-file.md' },
          { text: 'AI instructions', link: '/ai.md' },
        ],
      },
      {
        text: 'CLI',
        collapsed: true,
        items: [
          { text: 'create', link: '/cli/create.md' },
          { text: 'create-node', link: '/cli/create-node.md' },
          { text: 'build', link: '/cli/build.md' },
          { text: 'watch', link: '/cli/watch.md' },
          { text: 'ai', link: '/cli/ai.md' },
        ],
      },
      {
        text: 'API reference',
        collapsed: true,
        items: [
          {
            text: 'Utils (full stack)',
            collapsed: true,
            items: [
              { link: '/utils/utils-full-stack', text: 'Overview' },
              ...getGeneratedPages('./docs/utils', '/utils'),
            ],
          },
          {
            text: 'Utils (controller)',
            collapsed: true,
            items: [
              { link: '/utils/controller/utils-controller', text: 'Overview' },
              ...getGeneratedPages('./docs/utils/controller', '/utils/controller'),
            ],
          },
        ],
      },
      {
        text: 'Classic editor (pug / HTML)',
        collapsed: true,
        items: [
          {
            text: 'DOM Helper',
            collapsed: true,
            items: [{ link: '/editor/dom-helper', text: 'Overview' }, ...getGeneratedPages('./docs/editor', '/editor')],
          },
          {
            text: 'Templating',
            collapsed: true,
            items: [
              { link: '/editor/templating/pug', text: 'Pug' },
              { link: '/editor/templating/html', text: 'Html' },
              { link: '/editor/templating/classes', text: 'Available classes' },
            ],
          },
          { text: 'Styling nodes', link: '/editor/styles' },
        ],
      },
    ],
    outline: {
      level: [2, 3],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/clement-berard/node-red-dxp' }],
    footer: {
      message: `Version ${releaseVersion} - Built on ${buildDate}`,
    },
  },
});
