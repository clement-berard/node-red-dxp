import * as clack from '@clack/prompts';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ask, CancelledError, runAction, withSpinner } from '../ui';

vi.mock('@clack/prompts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@clack/prompts')>()),
  cancel: vi.fn(),
}));

describe('ask', () => {
  it('returns the answer', async () => {
    await expect(ask(Promise.resolve('yes'))).resolves.toBe('yes');
  });

  it('turns a cancellation into a CancelledError', async () => {
    await expect(ask(Promise.resolve(clack.CANCEL_SYMBOL as never))).rejects.toBeInstanceOf(CancelledError);
  });
});

describe('runAction', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

  it('reports a cancellation without an error status', async () => {
    await runAction(async () => {
      throw new CancelledError();
    });
    expect(clack.cancel).toHaveBeenCalledWith('Cancelled');
    expect(process.exitCode).toBeUndefined();
  });

  it('prints the message of an error and sets the exit code', async () => {
    const error = vi.spyOn(clack.log, 'error').mockImplementation(() => {});
    await runAction(async () => {
      throw new Error('boom');
    });
    expect(error).toHaveBeenCalledWith('boom');
    expect(process.exitCode).toBe(1);
  });
});

describe('withSpinner', () => {
  it('returns the result of the task', async () => {
    await expect(withSpinner('Working', 'Done', async () => 42)).resolves.toBe(42);
  });

  it('rethrows the error of the task', async () => {
    await expect(
      withSpinner('Working', 'Done', async () => {
        throw new Error('nope');
      }),
    ).rejects.toThrow('nope');
  });
});
