module.exports = {
  git: { commitMessage: "chore(release): ${version}", tagName: "v${version}", requireCleanWorkingDir: true, push: true },
  github: { release: true, tokenRef: "GITHUB_TOKEN" },
  npm: { publish: true, tokenRef: "NPM_TOKEN" },
  hooks: { "before:init": "pnpm build" },
  plugins: {
    "@release-it/conventional-changelog": {
      infile: false,
      preset: {
        name: "conventionalcommits",
        ignoreCommits: /^chore\(release\):/,
        types: [
          { type: "feat", section: "✨ Features" },
          { type: "fix", section: "🐛 Fixes" },
          { type: "chore", section: "📦 Chores" },
          { type: "docs", section: "📝 Documentation" },
          { type: "style", section: "💅 Styling" },
          { type: "refactor", section: "🔨 Refactors" },
          { type: "perf", section: "⚡ Performance Improvements" },
          { type: "test", section: "✅ Tests", },
          { type: "ci", section: "🔧 Continuous Integration" }
        ]
      }
    }
  }
};
