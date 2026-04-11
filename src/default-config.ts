import { z } from 'zod';

function getDefaults<T extends z.ZodTypeAny>(schema: T): z.infer<T> {
  return schema.parse({});
}

export const nodeRedWatcherSchema = z.strictObject({
  userDir: z
    .string()
    .describe('By default at `~/.node-red` or if `executable` is set to `package`, in local temp. node-red-dxp folder')
    .default('~/.node-red'),
  executable: z
    .union([z.string(), z.literal('package')])
    .describe(
      'By default using global node-red on your system. If `package` is provided, will be use local project node-red',
    )
    .default('node-red'),
  url: z.url().default('http://localhost:1880'),
});

export const browserSyncSchema = z.strictObject({
  host: z.string().default('localhost'),
  port: z.number().default(3003),
  reloadDelay: z.number().default(2000),
  open: z.boolean().default(false),
});

export const watcherSchema = z.strictObject({
  enabled: z.boolean().describe('Enabled BrowserSync and node-red hot reload').default(true),
  nodeRed: nodeRedWatcherSchema.default(getDefaults(nodeRedWatcherSchema)),
  browserSync: browserSyncSchema.default(getDefaults(browserSyncSchema)),
});

export const esbuildSchema = z.strictObject({
  includeInBundle: z.array(z.string()).default([]),
});

export const tailwindSchema = z.strictObject({
  forcedClassesInclusion: z.array(z.string()).default([]),
});

export const builderSchema = z.strictObject({
  outputDir: z.string().default('dist'),
  esbuildControllerOptions: esbuildSchema.default(getDefaults(esbuildSchema)),
  tailwind: tailwindSchema.default(getDefaults(tailwindSchema)),
});

export const RootSchema = z.strictObject({
  builder: builderSchema.default(getDefaults(builderSchema)),
  watcher: watcherSchema.default(getDefaults(watcherSchema)),
});

export type Config = z.infer<typeof RootSchema>;
export type UserInputConfig = z.input<typeof RootSchema>;

export function resolveConfig(inputs?: UserInputConfig): Config {
  return RootSchema.parse(inputs ?? {});
}
