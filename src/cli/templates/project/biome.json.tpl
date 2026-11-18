{
  "files": {
    "includes": ["src/**/*.ts", "src/**/*.json", "!**/dist"]
  },
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 120
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "suspicious": {
        "noExplicitAny": "off"
      }
    }
  }
}
