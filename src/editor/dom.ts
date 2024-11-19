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
    console.log('JE CLEAN');
    formElement.removeEventListener('input', updateSignal);
  });

  createEffect(() => {
    updateDOM(fieldValue());
  });

  setFieldValue(formElement.value || defaultValue);

  return [fieldValue, setFieldValue];
}
