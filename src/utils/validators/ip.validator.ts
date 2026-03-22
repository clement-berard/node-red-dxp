/**
 * @deprecated Use `isValidIP(ip, { version: 4 })` instead. This function will be removed in a future major version.
 * @see {@link isValidIP}
 *
 * (Deprecated)
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
 * // Prefer the new way:
 * isValidIP("192.168.1.1", { version: 4 }); // true
 * // Legacy:
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
 * @deprecated Use `isValidIP(ip, { version: 6 })` instead. This function will be removed in a future major version.
 * @see {@link isValidIP}
 *
 * (Deprecated)
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
 * // Prefer the new way:
 * isValidIP("2001:0db8:85a3:0000:0000:8a2e:0370:7334", { version: 6 }); // true
 * // Legacy:
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
 * Validates if the given string is a valid IP address.
 *
 * Supports IPv4, IPv6, or both depending on the `version` option.
 *
 * @param ip - The string to validate as an IP address.
 * @param options - Validation options.
 * @param options.version - If specified, restricts validation to `4` (IPv4 only) or `6` (IPv6 only). Defaults to both.
 * @returns `true` if the string is a valid IP address, otherwise `false`.
 *
 * @example
 * ```typescript
 * isValidIP("192.168.1.1"); // true
 * isValidIP("192.168.1.1", { version: 4 }); // true
 * isValidIP("192.168.1.1", { version: 6 }); // false
 * isValidIP("2001:0db8:85a3:0000:0000:8a2e:0370:7334"); // true
 * isValidIP("2001:0db8:85a3:0000:0000:8a2e:0370:7334", { version: 6 }); // true
 * isValidIP("localhost"); // false
 * ```
 */
export function isValidIP(ip: string, { version }: { version?: 4 | 6 } = {}) {
  if (version === 4) return isValidIPv4(ip);
  if (version === 6) return isValidIPv6(ip);
  return isValidIPv4(ip) || isValidIPv6(ip);
}
