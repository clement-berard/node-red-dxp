const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
  ...args: string[]
) => (...args: unknown[]) => Promise<unknown>;

/**
 * Compiles and runs a user-supplied JS snippet via the `AsyncFunction`
 * constructor (same family as `new Function(...)`, but the script body may
 * use top-level `await`).
 *
 * Meant for the scripts a user writes in the editor of a node (see the `CodeEditor` component).
 *
 * No sandboxing/isolation is applied on purpose — same trust model as a
 * Node-RED Function node. The script body may be sync or return a Promise;
 * the result is always awaited so both styles work transparently.
 *
 * Throws (rejects) on compile or runtime errors — callers are responsible
 * for try/catch and deciding how to react.
 */
export async function runUserScript<T = unknown>(
  scriptBody: string,
  argNames: string[],
  argValues: unknown[],
): Promise<T> {
  const userFunction = new AsyncFunction(...argNames, scriptBody);

  const result = await userFunction(...argValues);

  return result as T;
}
