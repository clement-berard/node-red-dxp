import { NODE_INPUT_PREFIX } from './constants';

/**
 * Retrieves values from form inputs within a specific prefix in their `id`.
 *
 * It searches for elements with an `id` starting with `node-input-{prefix}-` and extracts their values.
 * For checkboxes, it returns a boolean (`true` or `false`).
 * For other inputs (e.g., text, select), it returns their value as a string.
 *
 * @param prefix - The prefix of the `id` to filter the form inputs.
 * @returns An object where keys are derived from the input `id`, and values are the corresponding input values.
 *
 * @example
 * ```typescript
 * // HTML
 * // <input type="checkbox" id="node-input-settings-enabled" checked />
 * // <input type="text" id="node-input-settings-username" value="JohnDoe" />
 *
 * const values = getFormValues('settings');
 * console.log(values);
 * // Output: { enabled: true, username: 'JohnDoe' }
 * ```
 */
export function getFormValues(prefix: string): Record<string, string | boolean> {
  const values: Record<string, string | boolean> = {};

  document.querySelectorAll(`[id^="${NODE_INPUT_PREFIX}-${prefix}-"]`).forEach((element) => {
    const input = element as HTMLInputElement | HTMLSelectElement;
    const key = input.id.replace(`${NODE_INPUT_PREFIX}-${prefix}-`, '');
    if (input.type === 'checkbox') {
      values[key] = input.checked;
    } else {
      values[key] = input.value;
    }
  });

  return values;
}

/**
 * Sets values into form inputs identified by a specific prefix in their `id`.
 *
 * It searches for elements with an `id` starting with `node-input-{prefix}-` and assigns the provided values.
 * For checkboxes, it sets their `checked` state to `true` or `false`.
 * For other inputs (e.g., text, select), it sets their `value`.
 *
 * @param prefix - The prefix of the `id` to identify the form inputs.
 * @param values - An object where keys correspond to the suffix of the input `id`, and values are the corresponding input values.
 *
 * @example
 * ```typescript
 * // HTML
 * // <input type="checkbox" id="node-input-settings-enabled" />
 * // <input type="text" id="node-input-settings-username" />
 *
 * setFormValues('settings', { enabled: true, username: 'JaneDoe' });
 *
 * // Results in:
 * // Checkbox with id="node-input-settings-enabled" is checked
 * // Input with id="node-input-settings-username" has value "JaneDoe"
 * ```
 */
export function setFormValues(prefix: string, values: Record<string, unknown | boolean>): void {
  if (!values) {
    return;
  }

  Object.entries(values).forEach(([key, value]) => {
    const element = document.querySelector<HTMLInputElement | HTMLSelectElement>(
      `#${NODE_INPUT_PREFIX}-${prefix}-${key}`,
    );

    if (element) {
      if (element.type === 'checkbox') {
        (element as HTMLInputElement).checked = Boolean(value);
      } else {
        element.value = String(value);
      }
    }
  });
}
