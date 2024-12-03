import type { EditorDomHelper } from './types';

/**
 * Checks if a given selector is a node input selector.
 *
 * @param selector - The selector string to check.
 * @returns True if the selector is a node input selector, false otherwise.
 */
export function isNodeInput(selector: string) {
  const isNodeIdShortcut = selector.startsWith('$');
  const isNodeConfigIdShortcut = selector.startsWith('$$');
  const isFullSelector = selector.startsWith('#node-config-input') || selector.startsWith('#node-input');

  return {
    isNodeIdShortcut,
    isNodeConfigIdShortcut,
    isFullSelector,
    value: isNodeIdShortcut || isNodeConfigIdShortcut || isFullSelector,
  };
}

/**
 * Resolves a selector string into a specific format based on predefined rules.
 *
 * The function supports two shortcuts:
 * - `$`: Indicates a node input selector, resolved to `#node-input-{name}`.
 * - `$$`: Indicates a node config input selector, resolved to `#node-config-input-{name}`.
 *
 * If no shortcuts are detected, the function returns the input selector unchanged.
 *
 * @param inSelector - A string representing the selector.
 *                     May contain shortcuts `$` or `$$`.
 *
 * @returns The resolved selector as a string.
 *
 * @example
 * // Resolving a plain selector
 * resolveSelector('#my-element'); // Returns '#my-element'
 *
 * @example
 * // Resolving a `$` shortcut
 * resolveSelector('$node-name'); // Returns '#node-input-node-name'
 *
 * @example
 * // Resolving a `$$` shortcut
 * resolveSelector('$$config-name'); // Returns '#node-config-input-config-name'
 */
export function resolveSelector(inSelector: string) {
  const computed = isNodeInput(inSelector);
  if (computed.isNodeConfigIdShortcut) {
    return `#node-config-input-${inSelector.replace('$$', '')}`;
  }

  if (computed.isNodeIdShortcut) {
    return `#node-input-${inSelector.replace('$', '')}`;
  }

  return inSelector;
}

/**
 * Handles adding or removing CSS classes on multiple DOM elements based on the specified action.
 *
 * @param action - The action to perform: `'add'` to add classes, `'remove'` to remove classes.
 * @param selectors - An array of selector strings targeting the elements.
 * @param classes - An array of CSS class names to add or remove.
 *
 * @example
 * // Add a class to multiple elements
 * handleAddRemoveClassesOnSelectors('add', ['#element1', '.element2'], ['highlight']);
 *
 * @example
 * // Remove a class from multiple elements
 * handleAddRemoveClassesOnSelectors('remove', ['#element1', '.element2'], ['hidden']);
 */
export function handleAddRemoveClassesOnSelectors(action: 'add' | 'remove', selectors: string[], classes: string[]) {
  // biome-ignore lint/complexity/noForEach: <explanation>
  selectors.forEach((selector) => {
    const targetElement = document.querySelector(selector);
    if (targetElement) {
      // biome-ignore lint/complexity/noForEach: <explanation>
      classes.forEach((cls) => targetElement.classList[action](cls));
    }
  });
}

/**
 * Removes the specified CSS classes from multiple DOM elements.
 *
 * This is a wrapper for `handleAddRemoveClassesOnSelectors` with the action set to `'remove'`.
 *
 * @param selectors - An array of selector strings targeting the elements.
 * @param classesToRemove - An array of CSS class names to remove.
 *
 * @example
 * // Remove the class 'hidden' from multiple elements
 * removeClassesOnSelectors(['#element1', '.element2'], ['hidden']);
 */
export function removeClassesOnSelectors(selectors: string[], classesToRemove: string[]) {
  handleAddRemoveClassesOnSelectors('remove', selectors, classesToRemove);
}

/**
 * Adds the specified CSS classes to multiple DOM elements.
 *
 * This is a wrapper for `handleAddRemoveClassesOnSelectors` with the action set to `'add'`.
 *
 * @param selectors - An array of selector strings targeting the elements.
 * @param classesToAdd - An array of CSS class names to add.
 *
 * @example
 * // Add the class 'highlight' to multiple elements
 * addClassesOnSelectors(['#element1', '.element2'], ['highlight']);
 */
export function addClassesOnSelectors(selectors: string[], classesToAdd: string[]) {
  handleAddRemoveClassesOnSelectors('add', selectors, classesToAdd);
}

/**
 * Extracts the key part from a resolved input selector.
 *
 * The key is the part of the selector after `-input-`.
 *
 * @param selector - A string representing the input selector.
 * @returns The extracted key as a string.
 *
 * @example
 * resolveInputKey('$node-name'); // Returns 'node-name'
 * resolveInputKey('#node-input-custom'); // Returns 'custom'
 */
export function resolveInputKey(selector: string) {
  const realSelector = resolveSelector(selector);
  return realSelector.split('-input-')[1];
}

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
  const realSelector = resolveSelector(selector);
  let realOptions = options;
  if (params?.emptyValue) {
    realOptions = [{ value: '', text: params.emptyValue }, ...options];
  }
  $(realSelector)
    .empty()
    .append(
      realOptions.map((opt) => {
        return $('<option>', { value: opt.value, text: opt.text, selected: opt.value === params?.selected });
      }),
    );
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
 * @example
 * watchInput('$input-id', (values) => console.log(values));
 * watchInput(['$input-1', '$input-2'], (values) => console.log(values));
 */
export function watchInput<T = any>(selectors: string | string[], callback: (values: T[]) => void) {
  const selectorsArray = Array.isArray(selectors) ? selectors : [selectors];
  const realSelectors = selectorsArray.map(resolveSelector).join(', ');

  $(realSelectors).on('input', () => {
    const values = $(realSelectors)
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
  const realSelector = resolveSelector(selector);
  $(realSelector).val(val);
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
  const realSelector = resolveSelector(selector);
  $(realSelector).text(text);
}

/**
 * Resolves a given selector string into a jQuery object based on predefined rules.
 *
 * @param selector - A string representing the selector.
 *                   It can include special shortcuts such as `$` or `$$`.
 *
 * @returns A jQuery object corresponding to the resolved selector.
 *
 * @example
 * // Resolving a simple selector
 * jqSelector('#my-element'); // Returns a jQuery object for #my-element
 *
 * @example
 * // Using `$` shortcut for node input
 * jqSelector('$node-name');
 * // Resolves to: #node-input-node-name
 * // Returns a jQuery object for the resolved selector
 *
 * @example
 * // Using `$$` shortcut for node config input
 * jqSelector('$$config-name');
 * // Resolves to: #node-config-input-config-name
 * // Returns a jQuery object for the resolved selector
 */
export function jqSelector(selector: string) {
  const realSelector = resolveSelector(selector);
  return $(realSelector);
}

export function isCheckboxChecked(selector: string) {
  const realSelector = resolveSelector(selector);
  const checkbox = document.querySelector(realSelector) as HTMLInputElement;
  return checkbox.checked;
}
