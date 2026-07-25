import { createProgram } from './cli.utils';
import registerCreateCommands from './commands/create';

const program = createProgram('node-red-dxp CLI');

registerCreateCommands(program);

program.parse(process.argv);
