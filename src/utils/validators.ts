/**
 * Validates if the given string is a valid IPv4 address.
 *
 * An IPv4 address consists of four octets separated by dots,
 * where each octet is a number between 0 and 255.
 *
 * @param ip - The string to validate as an IPv4 address.
 * @returns `true` if the string is a valid IPv4 address, otherwise `false`.
 *
 * @example
 * ```typescript
 * isValidIPv4("192.168.1.1"); // true
 * isValidIPv4("256.256.256.256"); // false
 * isValidIPv4("localhost"); // false
 * ```
 */
export function isValidIPv4(ip: string) {
  const ipv4Pattern =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Pattern.test(ip);
}

/**
 * Validates if the given string is a valid IPv6 address.
 *
 * An IPv6 address is a 128-bit address represented as eight groups of four
 * hexadecimal digits, separated by colons. Shortened notation and mixed
 * IPv4/IPv6 formats are also supported.
 *
 * @param ip - The string to validate as an IPv6 address.
 * @returns `true` if the string is a valid IPv6 address, otherwise `false`.
 *
 * @example
 * ```typescript
 * isValidIPv6("2001:0db8:85a3:0000:0000:8a2e:0370:7334"); // true
 * isValidIPv6("1234::abcd"); // true
 * isValidIPv6("localhost"); // false
 * ```
 */
export function isValidIPv6(ip: string) {
  const ipv6Pattern =
    /^(([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)|(([0-9a-fA-F]{1,4}:){1,6}:)|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|([0-9a-fA-F]{1,4}:)((:[0-9a-fA-F]{1,4}){1,6})|(:((:[0-9a-fA-F]{1,4}){1,7}|:))|(fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,})|(::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9]))|(([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9])?[0-9])))$/;
  return ipv6Pattern.test(ip);
}

/**
 * Validates if the given string is a valid IPv4 or IPv6 address.
 *
 * Combines the validation checks for IPv4 and IPv6 addresses.
 *
 * @param ip - The string to validate as an IP address.
 * @returns `true` if the string is a valid IPv4 or IPv6 address, otherwise `false`.
 *
 * @example
 * ```typescript
 * isValidIP("192.168.1.1"); // true
 * isValidIP("2001:0db8:85a3:0000:0000:8a2e:0370:7334"); // true
 * isValidIP("localhost"); // false
 * ```
 */
export function isValidIP(ip: string) {
  return isValidIPv4(ip) || isValidIPv6(ip);
}

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
