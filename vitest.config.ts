import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { compile } from 'svelte/compiler';
import { defineConfig } from 'vitest/config';

const svelteDir = dirname(createRequire(import.meta.url).resolve('svelte/package.json'));

export default defineConfig({
  plugins: [
    {
      // compiles the `.svelte` files imported by the tests of the ui components
      name: 'svelte-for-tests',
      transform(code, id) {
        if (!id.endsWith('.svelte')) return;
        const { js } = compile(code, { filename: id, generate: 'client', css: 'injected' });
        return { code: js.code, map: js.map as any };
      },
    },
  ],
  // the client runtime of svelte: its default entry is the server one under node
  resolve: { alias: [{ find: /^svelte$/, replacement: join(svelteDir, 'src/index-client.js') }] },
});
