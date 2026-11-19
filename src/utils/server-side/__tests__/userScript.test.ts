import { describe, expect, it } from 'vitest';
import { runUserScript } from '../userScript';

describe('userScript', () => {
  describe('runUserScript', () => {
    it('should run a sync script and return its value', async () => {
      const result = await runUserScript('return a + b;', ['a', 'b'], [1, 2]);
      expect(result).toBe(3);
    });

    it('should await a script returning a Promise', async () => {
      const result = await runUserScript('return Promise.resolve(a * 2);', ['a'], [21]);
      expect(result).toBe(42);
    });

    it('should await an async script body', async () => {
      const result = await runUserScript(
        'await new Promise((resolve) => setTimeout(resolve, 1)); return "done";',
        [],
        [],
      );
      expect(result).toBe('done');
    });

    it('should expose provided arg names/values to the script', async () => {
      const result = await runUserScript(
        'request.url = request.url + "/suffix"; return request;',
        ['request'],
        [{ url: 'https://example.com' }],
      );
      expect(result).toEqual({ url: 'https://example.com/suffix' });
    });

    it('should return undefined when the script does not return anything', async () => {
      const result = await runUserScript('const x = 1;', [], []);
      expect(result).toBeUndefined();
    });

    it('should throw a SyntaxError for invalid script bodies', async () => {
      await expect(runUserScript('this is not valid js', [], [])).rejects.toThrow();
    });

    it('should propagate a thrown error from the script body', async () => {
      await expect(runUserScript('throw new Error("boom");', [], [])).rejects.toThrow('boom');
    });

    it('should propagate a rejected Promise from the script body', async () => {
      await expect(runUserScript('return Promise.reject(new Error("nope"));', [], [])).rejects.toThrow('nope');
    });
  });
});
