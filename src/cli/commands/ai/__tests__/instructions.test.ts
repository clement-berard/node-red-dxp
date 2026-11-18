import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AI_BLOCK_END, AI_BLOCK_START, buildAiBlock, upsertAiBlock, writeAiInstructions } from '../instructions';

describe('upsertAiBlock', () => {
  it('appends the block to existing content', () => {
    const result = upsertAiBlock('# My project\n');
    expect(result.startsWith('# My project\n\n')).toBe(true);
    expect(result).toContain(buildAiBlock());
  });

  it('creates the content when there is none', () => {
    expect(upsertAiBlock('')).toBe(`${buildAiBlock()}\n`);
  });

  it('replaces the block in place and keeps what is around it', () => {
    const stale = `before\n${AI_BLOCK_START}\nold text\n${AI_BLOCK_END}\nafter\n`;
    const result = upsertAiBlock(stale);
    expect(result).toBe(`before\n${buildAiBlock()}\nafter\n`);
    expect(result).not.toContain('old text');
  });

  it('is idempotent', () => {
    const once = upsertAiBlock('# Title');
    expect(upsertAiBlock(once)).toBe(once);
  });

  it('points to the guides shipped in dist/ai', () => {
    expect(buildAiBlock()).toContain('node_modules/@keload/node-red-dxp/dist/ai/overview.md');
  });
});

describe('writeAiInstructions', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'dxp-ai-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('creates AGENTS.md and a CLAUDE.md that imports it', async () => {
    const result = await writeAiInstructions(dir);

    expect(result).toEqual({ agents: 'created', claude: 'created' });
    expect(readFileSync(join(dir, 'AGENTS.md'), 'utf-8')).toContain(AI_BLOCK_START);
    expect(readFileSync(join(dir, 'CLAUDE.md'), 'utf-8')).toBe('@AGENTS.md\n');
  });

  it('keeps the existing AGENTS.md content and reports unchanged on a second run', async () => {
    writeFileSync(join(dir, 'AGENTS.md'), '# Mine\n');
    await writeAiInstructions(dir);
    const second = await writeAiInstructions(dir);

    expect(second).toEqual({ agents: 'unchanged', claude: 'unchanged' });
    expect(readFileSync(join(dir, 'AGENTS.md'), 'utf-8').startsWith('# Mine\n')).toBe(true);
  });

  it('never rewrites a CLAUDE.md of the user', async () => {
    writeFileSync(join(dir, 'CLAUDE.md'), 'My own rules\n');
    const result = await writeAiInstructions(dir);

    expect(result.claude).toBe('skipped');
    expect(readFileSync(join(dir, 'CLAUDE.md'), 'utf-8')).toBe('My own rules\n');
  });
});
