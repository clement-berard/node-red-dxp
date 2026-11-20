import { getContext } from 'svelte';

export const VALIDATE_CONTEXT = 'dxp-validate';

// `valid(key)` tells whether the property `key` of the node follows its `defaults` rules (`required`, `validate`):
// `true`, or `false`/the message of the validator. Always valid outside of a node editor
export function useValidation(): (key: string) => true | false | string | unknown[] {
  return getContext<(key: string) => true | false | string | unknown[]>(VALIDATE_CONTEXT) ?? (() => true);
}

// Same rules as Node-RED applies to a saved property (`required`, `validate` of its `defaults` entry): `true`, `false`,
// or the message returned by the validator
type Rule = { required?: boolean; validate?: (this: any, value: any, opt?: object) => unknown };

export function validateProperty(rule: Rule | undefined, value: unknown, node: object): boolean | string | unknown[] {
  // an environment variable is always valid
  if (!rule || /^\$[({][a-zA-Z_][a-zA-Z0-9_]*[)}]$/.test(String(value))) return true;
  if (rule.required && value === '') return false;
  if (typeof rule.validate !== 'function' || (rule.required === false && value === '')) return true;
  try {
    const result = rule.validate.call(node, value, {});
    return typeof result === 'string' || Array.isArray(result) ? (result as string | unknown[]) : !!result;
  } catch {
    return false;
  }
}
