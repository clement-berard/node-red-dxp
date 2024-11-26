import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "node-red-dxp",
  description: "Build nodes effortless",
  base: process.env.CI ? '/node-red-dxp/' : '/',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar: [
      { text: 'Get started', link: '/get-started.md' },
      { text: 'Config file', link: '/config-file.md' },
      {
        text: 'CLI',
        items: [
          { text: 'build', link: '/cli/build.md' },
          { text: 'watch', link: '/cli/watch.md' },
          { text: 'create-node', link: '/cli/create-node.md' },
        ]
      },
      {
        text: 'Features',
        items: [
          { text: 'i18n', link: '/i18n.md' },
          { text: 'Node Documentation', link: '/documentation.md' },
        ]
      },
      {
        text: 'Editor',
        items: [
          { text: 'DOM Helper ', link: '/editor/dom-helper.md' },
          { text: 'Template', link: '/editor/template.md' },
          { text: 'Styling nodes', link: '/editor/styles.md' },
        ]
      }
    ],
    outline: {
      level: [2, 3], // Inclure h2 et h3 dans la Table of Contents
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/clement-berard/node-red-dxp' }
    ]
  }
})
