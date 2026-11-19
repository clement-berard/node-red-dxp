type TypedFieldDefaultsParams = {
  /** Default value. */
  value: unknown;
  /** Main type of the value (`str`, `num`, `bool`, `json`...). */
  valueType: string;
  /** Type to start from instead of `valueType`, e.g. `from_client` for a node that inherits by default. */
  type?: string;
  required?: boolean;
};

/**
 * `defaults` of a property edited with `TypedField` (or `TypedInput`): the value and its `<field>Type`.
 *
 * @example
 * export const defaults = {
 *   ...typedFieldDefaults('timeout', { value: 5000, valueType: 'num', type: 'from_client' }),
 * };
 * // { timeout: { value: 5000 }, timeoutType: { value: 'from_client' } }
 */
export function typedFieldDefaults(field: string, params: TypedFieldDefaultsParams) {
  const { value, valueType, type = valueType, required } = params;
  return {
    [field]: { value, ...(required !== undefined && { required }) },
    [`${field}Type`]: { value: type },
  };
}
