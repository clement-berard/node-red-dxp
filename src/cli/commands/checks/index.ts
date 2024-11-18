import process from 'node:process';
import { Command } from 'commander';
// import { renderNodeValidation } from '../../node-dir';
const srcDir = `${process.cwd()}/src`;
// const nodesDir = `${srcDir}/nodes`;
export function registerChecksCommands(parentCommand: Command) {
  const checks = new Command('checks').description('Commandes pour les vérifications');

  checks
    .command('nodes-structure')
    .description('Vérifie la structure des dossiers nodes')
    .action(() => {
      // renderNodeValidation(nodesDir);
    });

  parentCommand.addCommand(checks);
}
