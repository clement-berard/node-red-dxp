import { existsSync } from 'node:fs';
import { join } from 'node:path';
// @ts-expect-error TS6 - No types exports in this package
import browserSync, { type BrowserSyncInstance } from 'browser-sync';
import chokidar from 'chokidar';
import nodemon, { type Nodemon } from 'nodemon';
import { build } from '../../../builder';
import { currentContext } from '../../../current-context';
import { log } from '../../ui';
import { runCommand } from '../../utils/run-command';
import { installLocalPackage } from '../install-relative-package/install-relative-package.cli';

let nodemonInstance: Nodemon;
let browserSyncInstance: BrowserSyncInstance;

function runNodemonAndBrowserSync() {
  const executableConfig = currentContext.config.watcher.nodeRed.executable;
  const userDirConfig = currentContext.config.watcher.nodeRed.userDir;
  const isExecutableLocalPackage = executableConfig === 'package';

  const localBin = join(currentContext.currentDir, 'node_modules', '.bin', 'node-red');

  if (isExecutableLocalPackage && !existsSync(localBin)) {
    log.error(`Local Node-RED executable not found at: ${localBin}`);
    log.info('Did you forget to install it? Install node-red in development mode in your package');
    log.info(`Your current Node-Red config: ${JSON.stringify(currentContext.config.watcher.nodeRed)}`);
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
    .once('start', async () => {
      const nodeRedVersion = (await runCommand(executable, ['--version'])).trim();
      log.info(`node-red ${nodeRedVersion} (${executable}), userDir: ${userDir}`);

      if (isExecutableLocalPackage) {
        try {
          await installLocalPackage({ pathToInstall: currentContext.currentDir, userDir });
          nodemonInstance.restart();
        } catch (error) {
          log.error(`Error while installing local package: ${error instanceof Error ? error.message : error}`);
        }
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
      log.info('Nodemon has quit');
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
  const minify = params?.minify ?? false;
  watcher
    .on('ready', async () => {
      log.info('Initial scan complete. Ready for changes');
      await build({ minify });
      log.success('Initial Build completed');
      if (hasNodeRedWatcher) {
        runNodemonAndBrowserSync();
      } else {
        log.warn('Node-Red watcher is disabled. Please enable it in the config file');
      }
    })
    .on('change', async (path: string) => {
      log.info(`File ${path.replace(currentContext.currentDir, '')} has been changed`);
      try {
        await build({ minify });
      } catch (error) {
        // a broken file must not stop the watch: fix it and save again
        log.error(`Build failed: ${error instanceof Error ? error.message : error}`);
        return;
      }
      log.success('Build completed');
      if (hasNodeRedWatcher) {
        restartNodemonAndBrowserSync();
      }
    });
}
