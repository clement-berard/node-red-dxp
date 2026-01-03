import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import packageJson from '../../package.json';

process.on('SIGINT', () => {
  console.log('\n\n👋 Operation cancelled by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Operation terminated');
  process.exit(0);
});

const PKG_NAME = packageJson.name;

function isInProject(): boolean {
  let dir = process.cwd();

  while (dir !== dirname(dir)) {
    try {
      const pkgPath = join(dir, 'package.json');
      const content = readFileSync(pkgPath, 'utf-8');
      const pkg = JSON.parse(content);

      if (pkg.dependencies?.[PKG_NAME] || pkg.devDependencies?.[PKG_NAME]) {
        process.chdir(dir);
        return true;
      }
    } catch {}
    dir = dirname(dir);
  }

  return false;
}

if (isInProject()) {
  require('./cli-with-project');
} else {
  require('./cli-without-project');
}
