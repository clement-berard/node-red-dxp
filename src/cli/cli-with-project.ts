import { Command } from 'commander';
import packageJson from '../../package.json';
import registerBuildCommands from './commands/build/build.cli';
import registerChecksCommands from './commands/checks/checks.cli';
import registerScaffoldingCommands from './commands/create-node/create-node.cli';
import registerInfoCommands from './commands/info/info.cli';
import registerInstallRelativePackageCommands from './commands/install-relative-package/install-relative-package.cli';
import registerWatchCommands from './commands/watch/watch.cli';

const program = new Command();
program.name('node-red-dxp').description('node-red-dxp CLI').version(packageJson.version);

registerBuildCommands(program);
registerWatchCommands(program);
registerInfoCommands(program);
registerChecksCommands(program);
registerScaffoldingCommands(program);
registerInstallRelativePackageCommands(program);

program.parse(process.argv);
