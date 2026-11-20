// Shows an error with the native notification of Node-RED: `Error : <message>`, closed after `timeout` ms
export function notifyError(message: string, timeout = 10_000) {
  (globalThis as any).RED?.notify(`Error : ${message}`, { type: 'error', timeout });
}
