/**
 * Validates if the given string is a valid URL.
 *
 * A valid URL includes a protocol (e.g., `http`, `https`) and conforms to
 * the URL standard. If the `lenient` option is enabled, it will attempt to
 * prepend `https://` to the input if it fails the initial check.
 *
 * @param string - The string to validate as a URL.
 * @param options - Validation options.
 * @param options.lenient - If `true`, tries to prepend `https://` to the input for lenient validation (default: `false`).
 * @returns `true` if the string is a valid URL, otherwise `false`.
 *
 * @throws `TypeError` if the input is not a string.
 *
 * @example
 * ```typescript
 * isUrl("https://example.com"); // true
 * isUrl("example.com", { lenient: true }); // true
 * isUrl("invalid url"); // false
 * ```
 */
export function isUrl(string: string, { lenient = false } = {}) {
  if (typeof string !== 'string') {
    throw new TypeError('isUrl: Expected a string');
  }

  const nString = string.trim();
  if (nString.includes(' ')) {
    return false;
  }

  try {
    new URL(nString); // eslint-disable-line no-new
    return true;
  } catch {
    if (lenient) {
      return isUrl(`https://${nString}`);
    }

    return false;
  }
}
