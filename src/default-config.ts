import { z } from 'zod';

export const ConfigSchema = z
  .object({
    builder: z
      .object({
        outputDir: z.string().default('dist'),
        esbuildControllerOptions: z
          .object({
            includeInBundle: z.array(z.string()).default([]),
          })
          .strict()
          .default({
            includeInBundle: [],
          }),
        tailwind: z
          .object({
            forcedClassesInclusion: z.array(z.string()).default([]),
          })
          .strict()
          .default({
            forcedClassesInclusion: [],
          }),
      })
      .strict()
      .default({
        outputDir: 'dist',
        esbuildControllerOptions: {
          includeInBundle: [],
        },
        tailwind: {
          forcedClassesInclusion: [],
        },
      }),
    watcher: z
      .object({
        nodeRed: z
          .object({
            enabled: z.boolean().default(true),
            path: z.string().default('~/.node-red'),
            url: z.url().default('http://localhost:1880'),
          })
          .strict(),
      })
      .strict()
      .default({
        nodeRed: {
          enabled: true,
          path: '~/.node-red',
          url: 'http://localhost:1880',
        },
      }),
  })
  .strict();

export const defaultConfig = ConfigSchema.parse({});
