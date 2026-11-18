import { Command } from 'commander';
import { currentContext } from '../../../current-context';
import { log, runAction } from '../../ui';
import { writeAiInstructions } from './instructions';

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('ai')
    .description(
      'Write the AI instructions of dxp in AGENTS.md (and CLAUDE.md), for coding agents working on the project',
    )
    .action(() =>
      runAction(async () => {
        const { agents, claude } = await writeAiInstructions(currentContext.currentDir);
        log.success(`AGENTS.md ${agents}`);
        if (claude === 'skipped') {
          log.warn('CLAUDE.md exists and does not import AGENTS.md: add the line `@AGENTS.md` to it');
        } else {
          log.info(`CLAUDE.md ${claude}`);
        }
      }),
    );

  parentCommand.addCommand(cmd);
}
