export declare const VALIDATE_CONTEXT: string;
/** Returns `valid(key)`: `true` when the property follows its `defaults` rules, otherwise `false` or the message. */
export declare function useValidation(): (key: string) => true | false | string;
/** Applies the `required` and `validate` rules of a `defaults` entry to a value, like Node-RED does on save. */
export declare function validateProperty(
  rule: { required?: boolean; validate?: (this: any, value: any, opt?: object) => unknown } | undefined,
  value: unknown,
  node: object,
): boolean | string | unknown[];
