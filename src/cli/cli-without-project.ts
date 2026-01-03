import { Command } from 'commander';
import packageJson from '../../package.json';
import registerCreateCommands from './commands/create';

const program = new Command();
program.name('node-red-dxp').description('node-red-dxp CLI').version(packageJson.version);

registerCreateCommands(program);

program.parse(process.argv);
