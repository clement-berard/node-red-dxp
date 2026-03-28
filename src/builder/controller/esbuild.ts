import fsPromise from 'node:fs/promises';
import type { OnLoadArgs, Plugin } from 'esbuild';

export const addCredentialsExportPlugin: Plugin = {
  name: 'add-credentials-export',
  setup(build) {
    build.onLoad({ filter: /controller\.ts$/ }, async (args: OnLoadArgs) => {
      const source = await fsPromise.readFile(args.path, 'utf8');
      const hasCredentialsExport = /export\s+const\s+credentials\s*=/.test(source);

      if (!hasCredentialsExport) {
        return {
          contents: `${source}\nexport const credentials = {};`,
          loader: 'ts',
        };
      }

      return { contents: source, loader: 'ts' };
    });
  },
};
