/**
 * Splits a message into two outputs based on a boolean condition.
 *
 * @param conditionTerm - The condition to evaluate. Expected to be a boolean (`true` or `false`).
 * @param msg - The message object to route based on the condition.
 *
 * @returns An array of two elements:
 * - The first element contains the message if `conditionTerm` is `true`, otherwise `null`.
 * - The second element contains the message if `conditionTerm` is `false`, otherwise `null`.
 *
 * @example
 * const msg = { payload: 'Hello, world!' };
 * const result = splitBooleanOutputs(true, msg);
 * console.log(result); // Output: [{ payload: 'Hello, world!' }, null]
 */
export function splitBooleanOutputs(conditionTerm: boolean, msg: unknown) {
  if (typeof conditionTerm !== 'boolean') {
    console.warn('Payload must be a boolean (true or false).');
    return [null, null];
  }

  return conditionTerm ? [msg, null] : [null, msg];
}
