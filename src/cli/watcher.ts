import browserSync, { type BrowserSyncInstance } from 'browser-sync';
import chokidar from 'chokidar';
import { consola } from 'consola';
import nodemon, { type Nodemon } from 'nodemon';
import { buildAllPackage, currentInstance } from '../builder';

let nodemonInstance: Nodemon;
let browserSyncInstance: BrowserSyncInstance;

function runNodemonAndBrowserSync() {
  // @ts-ignore
  nodemonInstance = nodemon({
    exec: `node-red -u ${currentInstance.config.watcher.nodeRed.path}`,
    ignore: ['**/*'],
    ext: 'js,html',
    verbose: true,
  });

  nodemon
    .once('start', () => {
      browserSyncInstance = browserSync.create();
      browserSyncInstance.init({
        ui: false,
        proxy: {
          target: currentInstance.config.watcher.nodeRed.url,
          ws: true,
        },
        ghostMode: false,
        open: false,
        reloadDelay: 4000,
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

const hasNodeRedWatcher = currentInstance.config.watcher.nodeRed.enabled && currentInstance.config.watcher.nodeRed.path;

export function runWatcher() {
  const watcher = chokidar.watch(currentInstance.pathSrcDir, {});

  watcher
    .on('ready', async () => {
      consola.info('Initial scan complete. Ready for changes');
      await buildAllPackage({
        minify: false,
      });
      consola.success('Initial Build completed');
      if (hasNodeRedWatcher) {
        runNodemonAndBrowserSync();
      } else {
        consola.warn('Node-Red watcher is disabled. Please enable it in the config file');
      }
    })
    .on('change', async (path: string) => {
      consola.info(`File ${path.replace(currentInstance.currentDir, '')} has been changed`);
      await buildAllPackage({
        minify: false,
      });
      consola.success('Build completed');
      if (hasNodeRedWatcher) {
        restartNodemonAndBrowserSync();
      }
    });
}
