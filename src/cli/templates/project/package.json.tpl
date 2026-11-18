{
  "name": "{{packageName}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "engines": {
    "node": ">=18"
  },
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "build": "node-red-dxp build",
    "dev": "node-red-dxp watch",
    "format": "biome format --write",
    "lint": "biome check",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "node-red": {
    "version": ">=2.0.0",
    "nodes": {
      "all": "dist/index.js"
    }
  },
  "devDependencies": {
    "@biomejs/biome": "^2.6.8",
    "@keload/node-red-dxp": "{{dxpSpec}}",
    "@types/jquery": "^3.5.33",
    "@types/jqueryui": "^1.12.24",
    "@types/node": "^25.0.1",
    "@types/node-red": "^1.3.5",
    "node-red": "^4.1.0",
    "typescript": "^5.9.3",
    "vitest": "^4.0.15"
  },
  "keywords": [
    "node-red",
    "node-red-contrib",
    "node-red-dxp"
  ],
  "license": "MIT",
  "files": [
    "dist"
  ]
}
