import { z } from 'zod';

export const watcher = z.strictObject({
  nodeRed: z.strictObject({
    enabled: z.boolean(),
    path: z.string(),
    url: z.url(),
  }),
  browserSync: z.strictObject({
    host: z.string(),
    port: z.number(),
    reloadDelay: z.number(),
    open: z.boolean(),
  }),
});

export const builder = z.strictObject({
  outputDir: z.string(),
  esbuildControllerOptions: z.strictObject({
    includeInBundle: z.array(z.string()),
  }),
  tailwind: z.strictObject({
    forcedClassesInclusion: z.array(z.string()),
  }),
});

export const RootSchema = z.strictObject({
  builder,
  watcher,
});

function getDefaultConfig(inputs: z.infer<typeof RootSchema>) {
  return RootSchema.parse(inputs);
}

export const defaultConfig = () =>
  getDefaultConfig({
    watcher: {
      nodeRed: {
        enabled: true,
        path: '~/.node-red',
        url: 'http://localhost:1880',
      },
      browserSync: {
        host: 'localhost',
        port: 3003,
        open: false,
        reloadDelay: 2000,
      },
    },
    builder: {
      outputDir: 'dist',
      esbuildControllerOptions: {
        includeInBundle: [],
      },
      tailwind: {
        forcedClassesInclusion: [],
      },
    },
  });
