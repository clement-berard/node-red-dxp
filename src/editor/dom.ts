import { createEffect, createSignal, onCleanup } from 'solid-js';
import { resolveSelector } from './utils';

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

/**
 * Adds a specified class to all elements that match the given selector.
 *
 * @param {string} selectors - A string containing one or more CSS selectors to match the elements.
 * @param {string} className - The class name to add to the matched elements.
 */
export function applyElementsClass(selectors: string, className: string) {
  // biome-ignore lint/complexity/noForEach: <explanation>
  document.querySelectorAll(selectors).forEach((div) => {
    div.classList.add(className);
  });
}
