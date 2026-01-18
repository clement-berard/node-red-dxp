import { z } from 'zod';

export const watcher = z
  .object({
    nodeRed: z
      .object({
        enabled: z.boolean(),
        path: z.string(),
        url: z.url(),
      })
      .strict(),
  })
  .strict();

export const builder = z
  .object({
    outputDir: z.string(),
    esbuildControllerOptions: z
      .object({
        includeInBundle: z.array(z.string()),
      })
      .strict(),
    tailwind: z
      .object({
        forcedClassesInclusion: z.array(z.string()),
      })
      .strict(),
  })
  .strict();

export const RootSchema = z
  .object({
    builder,
    watcher,
  })
  .strict();

function getDefaultConfig(inputs: z.infer<typeof RootSchema>) {
  return RootSchema.parse(inputs);
}

export const defaultConfig = getDefaultConfig({
  watcher: {
    nodeRed: {
      enabled: true,
      path: '~/.node-red',
      url: 'http://localhost:1880',
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
