import { afterEach, describe, expect, it, vi } from 'vitest';
import { notifyError } from '../ui/notify.js';

afterEach(() => {
  delete (globalThis as any).RED;
});

describe('notifyError', () => {
  it('should show the message as an error notification closed after 10 seconds', () => {
    const notify = vi.fn();
    (globalThis as any).RED = { notify };

    notifyError('connect EHOSTDOWN 10.0.0.19:1926');

    expect(notify).toHaveBeenCalledWith('Error : connect EHOSTDOWN 10.0.0.19:1926', { type: 'error', timeout: 10_000 });
  });

  it('should use the given timeout', () => {
    const notify = vi.fn();
    (globalThis as any).RED = { notify };

    notifyError('boom', 3000);

    expect(notify).toHaveBeenCalledWith('Error : boom', { type: 'error', timeout: 3000 });
  });

  it('should not fail outside of Node-RED', () => {
    expect(() => notifyError('boom')).not.toThrow();
  });
});
