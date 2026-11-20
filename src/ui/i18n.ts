import { getContext } from 'svelte';

export const TRANSLATE_CONTEXT = 'dxp-translate';

// "inputData" -> "Input data": the text shown when a key has no translation and no explicit fallback
export function humanize(key: string): string {
  const text = String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Translates `key` from the locale files of the node. When it is missing, `fallback` is shown, by default the
// humanized key
export function useT(): (key: string, fallback?: string) => string {
  const translate =
    getContext<((key: string, fallback: string) => string) | undefined>(TRANSLATE_CONTEXT) ??
    ((_key: string, fallback: string) => fallback);
  return (key, fallback = humanize(key)) => translate(key, fallback);
}
