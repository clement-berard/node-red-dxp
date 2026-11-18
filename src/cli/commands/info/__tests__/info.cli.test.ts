import { Command } from 'commander';
import prettyJson from 'prettyjson';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { log } from '../../../ui';
import commandHandler from '../info.cli';

vi.mock('../../../../current-context', () => ({
  currentContext: { marker: 'context' },
  currentConfig: { marker: 'config' },
}));

vi.mock('prettyjson', () => ({
  default: { render: vi.fn() },
}));

vi.mock('../../../ui', () => ({ log: { info: vi.fn() } }));

describe('info.cli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.mocked(prettyJson.render).mockImplementation((value) => `rendered:${JSON.stringify(value)}`);
  });

  it('renders currentContext by default', async () => {
    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['info'], { from: 'user' });

    expect(prettyJson.render).toHaveBeenCalledWith({ marker: 'context' });
    expect(console.log).toHaveBeenCalledWith('rendered:{"marker":"context"}');
    expect(log.info).not.toHaveBeenCalled();
  });

  it('renders currentConfig with a header when --config is passed', async () => {
    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['info', '--config'], { from: 'user' });

    expect(log.info).toHaveBeenCalledWith('Configuration information:');
    expect(prettyJson.render).toHaveBeenCalledWith({ marker: 'config' });
  });
});
