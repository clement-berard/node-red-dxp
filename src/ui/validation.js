import { getContext } from 'svelte';

export const VALIDATE_CONTEXT = 'dxp-validate';

// `valid(key)` tells whether the property `key` of the node follows its `defaults` rules (`required`, `validate`):
// `true`, or `false`/the message of the validator. Always valid outside of a node editor
export function useValidation() {
  return getContext(VALIDATE_CONTEXT) ?? (() => true);
}

// Same rules as Node-RED applies to a saved property (`required`, `validate` of its `defaults` entry): `true`, `false`,
// or the message returned by the validator
export function validateProperty(rule, value, node) {
  // an environment variable is always valid
  if (!rule || /^\$[({][a-zA-Z_][a-zA-Z0-9_]*[)}]$/.test(value)) return true;
  if (rule.required && value === '') return false;
  if (typeof rule.validate !== 'function' || (rule.required === false && value === '')) return true;
  try {
    const result = rule.validate.call(node, value, {});
    return typeof result === 'string' || Array.isArray(result) ? result : !!result;
  } catch {
    return false;
  }
}
