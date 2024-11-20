import browserSync, { type BrowserSyncInstance } from 'browser-sync';
import chokidar from 'chokidar';
import { consola } from 'consola';
import nodemon, { type Nodemon } from 'nodemon';
import { Context } from '../Context';
import { Builder } from '../builder';

let nodemonInstance: Nodemon;
let browserSyncInstance: BrowserSyncInstance;

function runNodemonAndBrowserSync(currentContext: Context) {
  // @ts-ignore
  nodemonInstance = nodemon({
    exec: `node-red -u ${currentContext.current.config.watcher.nodeRed.path}`,
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
          target: currentContext.current.config.watcher.nodeRed.url,
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

export function runWatcher() {
  const currentContext = new Context();
  const hasNodeRedWatcher =
    currentContext.current.config.watcher.nodeRed.enabled && currentContext.current.config.watcher.nodeRed.path;
  const watcher = chokidar.watch(currentContext.current.pathSrcDir, {});
  const builder = new Builder({ minify: false, context: currentContext });
  watcher
    .on('ready', async () => {
      consola.info('Initial scan complete. Ready for changes');
      await builder.buildAll();
      consola.success('Initial Build completed');
      if (hasNodeRedWatcher) {
        runNodemonAndBrowserSync(currentContext);
      } else {
        consola.warn('Node-Red watcher is disabled. Please enable it in the config file');
      }
    })
    .on('change', async (path: string) => {
      consola.info(`File ${path.replace(currentContext.current.currentDir, '')} has been changed`);
      await builder.buildAll();
      consola.success('Build completed');
      if (hasNodeRedWatcher) {
        restartNodemonAndBrowserSync();
      }
    });
}
