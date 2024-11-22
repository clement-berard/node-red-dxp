import fsPromise from 'node:fs/promises';

export const addCredentialsExportPlugin = {
  name: 'add-credentials-export',
  setup(build: any) {
    build.onLoad({ filter: /controller\.ts$/ }, async (args) => {
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
