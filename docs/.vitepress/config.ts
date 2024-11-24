import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "node-red-dxp",
  description: "Build nodes effortless",
  base: process.env.CI ? '/node-red-dxp/' : '/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      { text: 'Get started', link: '/cli-build.md' },
      { text: 'Usage', link: '/cli-watch.md' },
      { text: 'Why?', link: '/cli-watch.md' },
      {
        text: 'CLI',
        items: [
          { text: 'build', link: '/cli-build.md' },
          { text: 'watch', link: '/cli-watch.md' },
          { text: 'create-node', link: '/cli-watch.md' },
        ]
      },
      {
        text: 'Features',
        items: [
          { text: 'i18n', link: '/i18n.md' },
          { text: 'Documentation', link: '/documentation.md' },
        ]
      },
      {
        text: 'Editor',
        items: [
          { text: 'DOM Helper', link: '/editor-dom-helper.md' },
          { text: 'Template', link: '/editor/template.md' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/clement-berard/node-red-dxp' }
    ]
  }
})
