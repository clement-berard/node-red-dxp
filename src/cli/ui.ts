import * as clack from '@clack/prompts';

/** Thrown when the user cancels a prompt (Ctrl+C / Esc): stops the command without an error status. */
export class CancelledError extends Error {
  constructor() {
    super('Cancelled');
    this.name = 'CancelledError';
  }
}

/** Unwraps the answer of a clack prompt, turning a cancellation into a `CancelledError`. */
export async function ask<T>(prompt: Promise<T>): Promise<Exclude<T, symbol>> {
  const answer = await prompt;
  if (clack.isCancel(answer)) {
    throw new CancelledError();
  }
  return answer as Exclude<T, symbol>;
}

/** True when prompts can be shown: stdin and stdout are a terminal and no CI is detected. */
export function canPrompt(): boolean {
  return !!process.stdin.isTTY && !!process.stdout.isTTY && !process.env.CI;
}

/** Runs the action of a command: handles cancellation and reports the other errors without a stack trace. */
export async function runAction(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error) {
    if (error instanceof CancelledError) {
      clack.cancel('Cancelled');
      return;
    }
    clack.log.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

/** Runs `task` behind a spinner: `done` is shown on success, the spinner stops in error otherwise. */
export async function withSpinner<T>(label: string, done: string, task: () => Promise<T>): Promise<T> {
  const spin = clack.spinner();
  spin.start(label);
  try {
    const result = await task();
    spin.stop(done);
    return result;
  } catch (error) {
    spin.error(`${label} failed`);
    throw error;
  }
}

export const { intro, outro, log, note, cancel, text, select, confirm, spinner } = clack;
