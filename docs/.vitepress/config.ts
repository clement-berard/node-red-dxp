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
    nav: [{ text: 'Home', link: '/' }],
    sidebar: [
      { text: 'Overview', link: '/overview.md' },
      { text: 'Get Started', link: '/get-started.md' },
      { text: 'AI instructions', link: '/ai.md' },
      { text: 'Migration v1 → v2', link: '/migration-v1-to-v2.md' },
      { text: 'Configuration file', link: '/config-file.md' },
      {
        text: 'CLI',
        items: [
          { text: 'build', link: '/cli/build.md' },
          { text: 'watch', link: '/cli/watch.md' },
          { text: 'create', link: '/cli/create.md' },
          { text: 'create-node', link: '/cli/create-node.md' },
          { text: 'ai', link: '/cli/ai.md' },
        ],
      },
      {
        text: 'Features',
        items: [
          { text: 'Node Documentation', link: '/documentation.md' },
          { text: 'Server-side', link: '/server-side.md' },
          { text: 'Resources', link: '/resources.md' },
          { text: 'Internationalisation', link: '/i18n.md' },
          {
            text: 'Utils',
            collapsed: true,
            items: [
              {
                text: 'Full stack',
                collapsed: true,
                items: [
                  { link: '/utils/utils-full-stack', text: 'Overview' },
                  ...getGeneratedPages('./docs/utils', '/utils'),
                ],
              },
              {
                text: 'Controller',
                collapsed: true,
                items: [
                  { link: '/utils/controller/utils-controller', text: 'Overview' },
                  ...getGeneratedPages('./docs/utils/controller', '/utils/controller'),
                ],
              },
            ],
          },
        ],
      },
      {
        text: 'Svelte editor',
        items: [
          { text: 'Overview', link: '/svelte/' },
          { text: 'The node file', link: '/svelte/node-file' },
          { text: 'Components', link: '/svelte/components' },
          { text: 'Credentials', link: '/svelte/credentials' },
          { text: 'Config node', link: '/svelte/config-node' },
          { text: 'Help and i18n', link: '/svelte/help-and-i18n' },
          { text: 'Styling', link: '/svelte/styling' },
          { text: 'TypeScript and IDE', link: '/svelte/typescript' },
          { text: 'Migrate from pug', link: '/svelte/migration' },
          { text: 'Troubleshooting', link: '/svelte/troubleshooting' },
        ],
      },
      {
        text: 'Editor',
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
