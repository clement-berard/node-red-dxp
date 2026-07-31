import { NODE_CONFIG_INPUT_PREFIX, NODE_INPUT_PREFIX } from './constants';

/**
 * Checks if a given selector is a node input selector.
 *
 * @param selector - The selector string to check.
 * @returns True if the selector is a node input selector, false otherwise.
 */
export function isNodeInput(selector: string) {
  const isNodeIdShortcut = selector.startsWith('$');
  const isNodeConfigIdShortcut = selector.startsWith('$$');
  const isFullSelector =
    selector.startsWith(`#${NODE_CONFIG_INPUT_PREFIX}`) || selector.startsWith(`#${NODE_INPUT_PREFIX}`);

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
    return `#${NODE_CONFIG_INPUT_PREFIX}-${inSelector.replace('$$', '')}`;
  }

  if (computed.isNodeIdShortcut) {
    return `#${NODE_INPUT_PREFIX}-${inSelector.replace('$', '')}`;
  }

  return inSelector;
}

/**
 * Extracts the key part from a resolved input selector.
 *
 * The key is the part of the selector after the `#node-input-` or `#node-config-input-` prefix.
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
  return realSelector.replace(`#${NODE_CONFIG_INPUT_PREFIX}-`, '').replace(`#${NODE_INPUT_PREFIX}-`, '');
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

/**
 * Checks whether a checkbox is checked based on a CSS selector.
 *
 * @param selector - A valid CSS selector to identify the checkbox element.
 * @returns `true` if the checkbox is checked, otherwise `false`.
 *
 * @example
 * ```typescript
 * const isChecked = isCheckboxChecked('#my-checkbox');
 * console.log(isChecked); // true or false
 * ```
 */
export function isCheckboxChecked(selector: string) {
  const realSelector = resolveSelector(selector);
  const checkbox = document.querySelector(realSelector) as HTMLInputElement;
  return checkbox.checked;
}
