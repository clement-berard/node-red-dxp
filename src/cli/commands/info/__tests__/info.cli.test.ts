import { Command } from 'commander';
import { consola } from 'consola';
import prettyJson from 'prettyjson';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import commandHandler from '../info.cli';

vi.mock('../../../../current-context', () => ({
  currentContext: { marker: 'context' },
  currentConfig: { marker: 'config' },
}));

vi.mock('prettyjson', () => ({
  default: { render: vi.fn() },
}));

vi.mock('consola', () => ({
  consola: { log: vi.fn() },
}));

describe('info.cli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prettyJson.render).mockImplementation((value) => `rendered:${JSON.stringify(value)}`);
  });

  it('renders currentContext by default', async () => {
    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['info'], { from: 'user' });

    expect(prettyJson.render).toHaveBeenCalledWith({ marker: 'context' });
    expect(consola.log).toHaveBeenCalledWith('rendered:{"marker":"context"}');
    expect(consola.log).not.toHaveBeenCalledWith('Configuration information:');
  });

  it('renders currentConfig with a header when --config is passed', async () => {
    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['info', '--config'], { from: 'user' });

    expect(consola.log).toHaveBeenCalledWith('Configuration information:');
    expect(prettyJson.render).toHaveBeenCalledWith({ marker: 'config' });
  });
});
