import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
// @ts-expect-error TS6 - No types exports in this package
import browserSync, { type BrowserSyncInstance } from 'browser-sync';
import chokidar from 'chokidar';
import { consola } from 'consola';
import nodemon, { type Nodemon } from 'nodemon';
import { Builder } from '../../../builder';
import { currentContext } from '../../../current-context';
import { installLocalPackage } from '../install-relative-package/install-relative-package.cli';

let nodemonInstance: Nodemon;
let browserSyncInstance: BrowserSyncInstance;

function runNodemonAndBrowserSync() {
  const executableConfig = currentContext.config.watcher.nodeRed.executable;
  const userDirConfig = currentContext.config.watcher.nodeRed.userDir;
  const isExecutableLocalPackage = executableConfig === 'package';

  const localBin = join(currentContext.currentDir, 'node_modules', '.bin', 'node-red');

  if (isExecutableLocalPackage && !existsSync(localBin)) {
    consola.error(`Local Node-RED executable not found at: ${localBin}`);
    consola.info('Did you forget to install it? Install node-red in development mode in your package');
    consola.info('Your current Node-Red config', currentContext.config.watcher.nodeRed);
    process.exit(1);
  }

  const executable = isExecutableLocalPackage ? localBin : executableConfig;
  const userDir = isExecutableLocalPackage ? join(currentContext.pathLibCacheDir, '.node-red-local') : userDirConfig;

  // @ts-expect-error
  nodemonInstance = nodemon({
    exec: `${executable} -u ${userDir}`,
    ignore: ['**/*'],
    ext: 'js,html',
    verbose: true,
  });

  nodemon
    .once('start', () => {
      consola.info('node-red instance', {
        executable,
        userDir,
        nodeRedVersion: execSync(`${executable} --version`).toString(),
      });

      if (isExecutableLocalPackage) {
        installLocalPackage({ pathToInstall: currentContext.currentDir, userDir });
        nodemonInstance.restart();
      }

      browserSyncInstance = browserSync.create();
      browserSyncInstance.init({
        ui: false,
        proxy: {
          target: currentContext.config.watcher.nodeRed.url,
          ws: true,
        },
        host: currentContext.config.watcher.browserSync.host,
        port: currentContext.config.watcher.browserSync.port,
        ghostMode: false,
        open: currentContext.config.watcher.browserSync.open,
        reloadDelay: currentContext.config.watcher.browserSync.reloadDelay,
      });
    })
    .on('quit', () => {
      consola.info('Nodemon has quit');
      process.exit(0);
    });
}

function restartNodemonAndBrowserSync() {
  nodemonInstance.restart();
  browserSyncInstance.reload();
}

type RunWatcherParams = {
  minify?: boolean;
};

export function runWatcher(params?: RunWatcherParams) {
  const hasNodeRedWatcher = currentContext.config.watcher.enabled && currentContext.config.watcher.nodeRed.executable;
  const watcher = chokidar.watch(currentContext.pathSrcDir, {});
  const builder = new Builder({ minify: params?.minify ?? false });
  watcher
    .on('ready', async () => {
      consola.info('Initial scan complete. Ready for changes');
      await builder.buildAll();
      consola.success('Initial Build completed');
      if (hasNodeRedWatcher) {
        runNodemonAndBrowserSync();
      } else {
        consola.warn('Node-Red watcher is disabled. Please enable it in the config file');
      }
    })
    .on('change', async (path: string) => {
      consola.info(`File ${path.replace(currentContext.currentDir, '')} has been changed`);
      await builder.buildAll();
      consola.success('Build completed');
      if (hasNodeRedWatcher) {
        restartNodemonAndBrowserSync();
      }
    });
}
