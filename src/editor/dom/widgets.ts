import type { EditorWidgetTypedInputType, EditorWidgetTypedInputTypeDefinition } from 'node-red';
import type { EditorDomHelper } from '../types';
import { jqSelector, resolveSelector } from './selectors';

type HTMLElementEventType = keyof HTMLElementEventMap;

/**
 * Initializes a `<select>` element with the given options.
 *
 * - The function clears the existing options and populates the `<select>` with new ones.
 * - Supports an optional empty value.
 * - Allows pre-selecting an option based on the `params` object.
 *
 * @param selector - The selector for the `<select>` element.
 * @param options - An array of objects representing the options, with `value` and `text` properties.
 * @param params - Optional parameters for customization.
 *
 * @example
 * initSelect('$select-id', [{ value: '1', text: 'Option 1' }, { value: '2', text: 'Option 2' }]);
 * initSelect('$select-id', [{ value: '1', text: 'Option 1' }], { emptyValue: 'Select an option', selected: '1' });
 */
export function initSelect(
  selector: string,
  options: Record<string, string>[],
  params?: EditorDomHelper.InitSelectParams,
) {
  let realOptions = options;
  if (params?.emptyValue) {
    realOptions = [{ value: '', text: params.emptyValue }, ...options];
  }
  jqSelector(selector)
    .empty()
    .append(
      realOptions.map((opt) => {
        return $('<option>', { value: opt.value, text: opt.text, selected: opt.value === params?.selected });
      }),
    );
}

/**
 * Applies a typed input widget to a DOM element.
 *
 * @param params - Configuration object for the typed input
 * @param params.selector - CSS selector of the input element to enhance
 * @param params.types - Array of available input types or type definitions
 *
 * @example
 * ```typescript
 * applyTypedInput({
 *   selector: '$myInput',
 *   types: ['str', 'num', 'bool']
 * });
 * ```
 */
export function applyTypedInput(params: {
  selector: string;
  types: (EditorWidgetTypedInputType | EditorWidgetTypedInputTypeDefinition)[];
}) {
  jqSelector(params.selector).typedInput({
    types: params.types,
    typeField: resolveSelector(`${params.selector}Type`),
  });
}

/**
 * Watches for changes on input elements and triggers a callback with the updated values.
 *
 * - Supports single or multiple selectors.
 * - Calls the callback every time an input event occurs on the specified elements.
 *
 * @param selectors - A single selector string or an array of selector strings.
 * @param callback - A function to call with the updated values of the inputs.
 *
 * @param opt
 * @example
 * watchInput('$input-id', (values) => console.log(values));
 * watchInput(['$input-1', '$input-2'], (values) => console.log(values));
 */
export function watchInput<T = any>(
  selectors: string | string[],
  callback: (values: T[]) => void,
  opt: { additionalEvents: HTMLElementEventType[] } = { additionalEvents: [] },
) {
  const selectorsArray = Array.isArray(selectors) ? selectors : [selectors];
  const realSelectors = selectorsArray.map(resolveSelector).join(', ');
  const events: HTMLElementEventType[] = ['input', ...opt.additionalEvents];
  const $elements = $(realSelectors);

  $elements.on(events.join(' '), () => {
    const values = $elements
      .map(function () {
        return $(this).val() as T;
      })
      .get();

    callback(values);
  });
}

/**
 * Sets the value of an input element.
 *
 * @param selector - The selector for the input element.
 * @param val - The value to set.
 *
 * @example
 * setInputValue('$input-id', 'new value');
 */
export function setInputValue(selector: string, val: string) {
  jqSelector(selector).val(val);
}

/**
 * Sets the text content of a DOM element.
 *
 * @param selector - The selector for the element.
 * @param text - The text to set as the content.
 *
 * @example
 * setText('#label-id', 'Updated text');
 */
export function setText(selector: string, text: string) {
  jqSelector(selector).text(text);
}
