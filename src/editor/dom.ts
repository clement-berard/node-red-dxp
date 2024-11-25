import { createEffect, createSignal, onCleanup } from 'solid-js';
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

export function createReactiveField<T extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
  selector: string,
  defaultValue?: string,
): [() => string, (value: string) => void] {
  const realSelector = resolveSelector(selector);

  const formElement = document.querySelector(realSelector) as T;

  if (!formElement) {
    throw new Error(`Element with id '${selector}' not found`);
  }

  const [fieldValue, setFieldValue] = createSignal(defaultValue || '');

  const updateSignal = () => {
    setFieldValue(formElement.value);
  };

  const updateDOM = (newValue: string) => {
    if (formElement.value !== newValue) {
      formElement.value = newValue;
    }
  };

  formElement.addEventListener('input', updateSignal);

  onCleanup(() => {
    formElement.removeEventListener('input', updateSignal);
  });

  createEffect(() => {
    updateDOM(fieldValue());
  });

  setFieldValue(formElement.value || defaultValue);

  return [fieldValue, setFieldValue];
}

export function handleAddRemoveClassesOnSelectors(
  action: 'add' | 'remove',
  selectors: string[],
  classesToRemove: string[],
) {
  // biome-ignore lint/complexity/noForEach: <explanation>
  selectors.forEach((selector) => {
    const targetElement = document.querySelector(selector);
    if (targetElement) {
      // biome-ignore lint/complexity/noForEach: <explanation>
      classesToRemove.forEach((cls) => targetElement.classList[action](cls));
    }
  });
}

export function removeClassesOnSelectors(selectors: string[], classesToRemove: string[]) {
  handleAddRemoveClassesOnSelectors('remove', selectors, classesToRemove);
}

export function addClassesOnSelectors(selectors: string[], classesToAdd: string[]) {
  handleAddRemoveClassesOnSelectors('add', selectors, classesToAdd);
}

export function resolveInputKey(selector: string) {
  const realSelector = resolveSelector(selector);
  return realSelector.split('-input-')[1];
}

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

export function setInputValue(selector: string, val: string) {
  const realSelector = resolveSelector(selector);
  $(realSelector).val(val);
}

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
