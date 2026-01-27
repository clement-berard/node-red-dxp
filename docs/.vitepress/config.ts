import { defineConfig } from 'vitepress';
import { npmCommandsMarkdownPlugin } from 'vitepress-plugin-npm-commands';
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs';

const releaseVersion = process.env.RELEASE_VERSION || 'dev';
const buildDate = new Date().toISOString().split('T')[0];

// https://vitepress.dev/reference/site-config
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
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: 'Home', link: '/' }],

    sidebar: [
      { text: 'Overview', link: '/overview.md' },
      { text: 'Usage', link: '/usage.md' },
      { text: 'Configuration file', link: '/config-file.md' },
      {
        text: 'CLI',
        items: [
          { text: 'build', link: '/cli/build.md' },
          { text: 'watch', link: '/cli/watch.md' },
          { text: 'create-node', link: '/cli/create-node.md' },
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
              { link: '/utils/utils-full-stack.md', text: 'Full stack' },
              { link: '/utils/utils-controller.md', text: 'Controller' },
            ],
          },
        ],
      },
      {
        text: 'Editor',
        items: [
          { text: 'DOM Helper ', link: '/editor/dom-helper.md' },
          {
            text: 'Templating',
            collapsed: true,
            items: [
              { link: '/editor/templating/pug.md', text: 'Pug' },
              { link: '/editor/templating/html.md', text: 'Html' },
              { link: '/editor/templating/classes.md', text: 'Available classes' },
            ],
          },
          { text: 'Styling nodes', link: '/editor/styles.md' },
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
