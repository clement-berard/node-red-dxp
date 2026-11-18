// Generates a `<Component>.svelte.d.ts` next to each ui component of dist: the types the IDE and tsc read
import { createRequire } from 'node:module';
import path from 'node:path';
import { emitDts } from 'svelte2tsx';

const require = createRequire(import.meta.url);

await emitDts({
  libRoot: 'src/ui',
  tsconfig: path.resolve('tsconfig.json'),
  declarationDir: 'dist/ui',
  svelteShimsPath: require.resolve('svelte2tsx/svelte-shims-v4.d.ts'),
});
