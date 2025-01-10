import { defineConfig } from 'vitepress';
import { npmCommandsMarkdownPlugin } from 'vitepress-plugin-npm-commands';
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'node-red-dxp',
  description: 'Build nodes effortless',
  base: process.env.CI ? '/node-red-dxp/' : '/',
  head: [
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
      { text: 'Get started', link: '/get-started.md' },
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
          { text: 'i18n', link: '/i18n.md' },
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
          { text: 'Template', link: '/editor/template.md' },
          { text: 'Styling nodes', link: '/editor/styles.md' },
        ],
      },
    ],
    outline: {
      level: [2, 3],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/clement-berard/node-red-dxp' }],
  },
});
