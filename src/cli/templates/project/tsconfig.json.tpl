{
  "compilerOptions": {
    "declaration": false,
    "module": "ESNext",
    "target": "ES2022",
    "outDir": "dist",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "noEmit": true,
    "types": ["jquery", "jqueryui", "node-red", "@keload/node-red-dxp"]
  },
  "include": ["./src/**/*.ts"],
  "exclude": ["./src/nodes/**/editor/**/*", "./test"]
}
