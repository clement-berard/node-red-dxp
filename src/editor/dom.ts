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
 * Resolves a given selector to a specific format based on its prefix.
 *
 * @param inSelector - The input selector string to resolve.
 * @returns The resolved selector string.
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
