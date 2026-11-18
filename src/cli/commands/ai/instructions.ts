import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const AI_BLOCK_START = '<!-- node-red-dxp:start -->';
export const AI_BLOCK_END = '<!-- node-red-dxp:end -->';

const GUIDES_DIR = 'node_modules/@keload/node-red-dxp/dist/ai';

export type WriteResult = 'created' | 'updated' | 'unchanged';

/** Block of `AGENTS.md` owned by dxp: it only points to the guides of the installed version, so it never goes stale. */
export function buildAiBlock(): string {
  return [
    AI_BLOCK_START,
    '## node-red-dxp',
    '',
    'This package is built with `@keload/node-red-dxp`. The guides below ship with the installed version:',
    'read the one that matches your task **before** creating or changing a node.',
    '',
    `- \`${GUIDES_DIR}/overview.md\`: layout, commands and rules of the project (read first)`,
    `- \`${GUIDES_DIR}/svelte-node.md\`: write or change a Svelte node (preferred for new nodes)`,
    `- \`${GUIDES_DIR}/classic-node.md\`: maintain a classic (html/pug + ts) node`,
    `- \`${GUIDES_DIR}/migrate-to-svelte.md\`: convert a classic node to Svelte`,
    '',
    'Create a node with `npx node-red-dxp create-node`. Refresh this block with `npx node-red-dxp ai`.',
    AI_BLOCK_END,
  ].join('\n');
}

/** Replaces the dxp block of `content`, or appends it when there is none. Anything outside the markers is kept. */
export function upsertAiBlock(content: string): string {
  const block = buildAiBlock();
  const start = content.indexOf(AI_BLOCK_START);
  const end = content.indexOf(AI_BLOCK_END);

  if (start !== -1 && end > start) {
    return content.slice(0, start) + block + content.slice(end + AI_BLOCK_END.length);
  }

  const base = content.trimEnd();
  return base ? `${base}\n\n${block}\n` : `${block}\n`;
}

async function writeIfChanged(filePath: string, next: string): Promise<WriteResult> {
  const exists = existsSync(filePath);
  const previous = exists ? await readFile(filePath, 'utf-8') : '';
  if (exists && previous === next) {
    return 'unchanged';
  }
  await writeFile(filePath, next);
  return exists ? 'updated' : 'created';
}

export type AiInstructionsResult = {
  agents: WriteResult;
  /** `CLAUDE.md` is only created: an existing one is the user's, and `skipped` tells it does not import `AGENTS.md`. */
  claude: WriteResult | 'skipped';
};

/** Writes the dxp block in `AGENTS.md` (the file read by most coding agents) and makes `CLAUDE.md` import it. */
export async function writeAiInstructions(projectDir: string): Promise<AiInstructionsResult> {
  const agentsPath = join(projectDir, 'AGENTS.md');
  const current = existsSync(agentsPath) ? await readFile(agentsPath, 'utf-8') : '';
  const agents = await writeIfChanged(agentsPath, upsertAiBlock(current));

  const claudePath = join(projectDir, 'CLAUDE.md');
  let claude: AiInstructionsResult['claude'];
  if (!existsSync(claudePath)) {
    claude = await writeIfChanged(claudePath, '@AGENTS.md\n');
  } else {
    const claudeContent = await readFile(claudePath, 'utf-8');
    claude = claudeContent.includes('AGENTS.md') ? 'unchanged' : 'skipped';
  }

  return { agents, claude };
}
