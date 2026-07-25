import { createProgram } from './cli.utils';
import registerBuildCommands from './commands/build/build.cli';
import registerChecksCommands from './commands/checks/checks.cli';
import registerScaffoldingCommands from './commands/create-node/create-node.cli';
import registerInfoCommands from './commands/info/info.cli';
import registerInstallRelativePackageCommands from './commands/install-relative-package/install-relative-package.cli';
import registerWatchCommands from './commands/watch/watch.cli';

const program = createProgram('node-red-dxp CLI');

registerBuildCommands(program);
registerWatchCommands(program);
registerInfoCommands(program);
registerChecksCommands(program);
registerScaffoldingCommands(program);
registerInstallRelativePackageCommands(program);

program.parse(process.argv);
