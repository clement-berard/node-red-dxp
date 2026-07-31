import { describe, expect, it } from 'vitest';
import { isValidIP } from '../validators/ip.validator';
import { isUrl } from '../validators/url.validator';

describe('validators', () => {
  describe('isValidIP', () => {
    it('should return true for valid IPv4 addresses', () => {
      expect(isValidIP('192.168.1.1')).toBe(true);
      expect(isValidIP('127.0.0.1')).toBe(true);
      expect(isValidIP('0.0.0.0')).toBe(true);
      expect(isValidIP('255.255.255.255')).toBe(true);
      expect(isValidIP('10.0.0.1')).toBe(true);
      expect(isValidIP('192.168.1.1', { version: 4 })).toBe(true);
    });

    it('should return true for valid IPv6 addresses', () => {
      expect(isValidIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
      expect(isValidIP('2001:db8:85a3:0:0:8a2e:370:7334')).toBe(true);
      expect(isValidIP('2001:db8:85a3::8a2e:370:7334')).toBe(true);
      expect(isValidIP('::1')).toBe(true); // loopback
      expect(isValidIP('::')).toBe(true); // all zeros
      expect(isValidIP('1234::abcd')).toBe(true);
      expect(isValidIP('fe80::1')).toBe(true);
      expect(isValidIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334', { version: 6 })).toBe(true);
    });

    it('should return false for invalid IP addresses', () => {
      expect(isValidIP('localhost')).toBe(false);
      expect(isValidIP('256.256.256.256')).toBe(false);
      expect(isValidIP('gggg::1')).toBe(false);
      expect(isValidIP('')).toBe(false);
      expect(isValidIP('192.168.1')).toBe(false);
      expect(isValidIP('192.168.1.1.1')).toBe(false);
      expect(isValidIP('abc.def.ghi.jkl')).toBe(false);
      expect(isValidIP('192.168.-1.1')).toBe(false);
      expect(isValidIP('2001:0db8:85a3::8a2e::7334')).toBe(false); // double ::
      expect(isValidIP('12345::1')).toBe(false); // too many digits
      expect(isValidIP('2001:db8:85a3:0:0:8a2e:370:7334:extra')).toBe(false); // too many groups
      expect(isValidIP('2001:db8:85a3:0:0:8a2e:370')).toBe(false); // too few groups
    });

    it('should handle edge cases', () => {
      expect(isValidIP('192.168.1.256')).toBe(false); // out of range
      expect(isValidIP('192.168.1.1 ')).toBe(false); // trailing space
      expect(isValidIP(' 192.168.1.1')).toBe(false); // leading space
    });

    it('should restrict validation to the requested version', () => {
      expect(isValidIP('192.168.1.1', { version: 6 })).toBe(false);
      expect(isValidIP('256.256.256.256', { version: 4 })).toBe(false);
      expect(isValidIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334', { version: 4 })).toBe(false);
      expect(isValidIP('gggg::1', { version: 6 })).toBe(false);
    });
  });

  describe('isUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isUrl('https://example.com')).toBe(true);
      expect(isUrl('http://example.com')).toBe(true);
      expect(isUrl('https://www.example.com/path')).toBe(true);
      expect(isUrl('https://example.com:8080')).toBe(true);
      expect(isUrl('ftp://example.com')).toBe(true);
      expect(isUrl('https://example.com/path?query=value')).toBe(true);
      expect(isUrl('https://example.com/path#fragment')).toBe(true);
    });

    it('should return false for invalid URLs', () => {
      expect(isUrl('invalid url')).toBe(false);
      expect(isUrl('example.com')).toBe(false); // no protocol
      expect(isUrl('http://')).toBe(false);
      expect(isUrl('')).toBe(false);
      expect(isUrl('not a url at all')).toBe(false);
    });

    it('should handle lenient mode', () => {
      expect(isUrl('example.com', { lenient: true })).toBe(true);
      expect(isUrl('www.example.com', { lenient: true })).toBe(true);
      expect(isUrl('subdomain.example.com', { lenient: true })).toBe(true);
      expect(isUrl('example.com/path', { lenient: true })).toBe(true);

      // Should still fail for clearly invalid URLs even in lenient mode
      expect(isUrl('invalid url with spaces', { lenient: true })).toBe(false);
      expect(isUrl('', { lenient: true })).toBe(false);
    });

    it('should throw TypeError for non-string input', () => {
      expect(() => isUrl(123 as any)).toThrow(TypeError);
      expect(() => isUrl(null as any)).toThrow(TypeError);
      expect(() => isUrl(undefined as any)).toThrow(TypeError);
      expect(() => isUrl({} as any)).toThrow(TypeError);
      expect(() => isUrl([] as any)).toThrow(TypeError);
    });

    it('should handle URLs with spaces', () => {
      expect(isUrl('https://example.com with spaces')).toBe(false);
      expect(isUrl(' https://example.com')).toBe(true); // leading space is trimmed
      expect(isUrl('https://example.com ')).toBe(true); // trailing space is trimmed
    });

    it('should handle edge cases', () => {
      expect(isUrl('   ')).toBe(false); // only spaces
      expect(isUrl('https://localhost')).toBe(true);
      expect(isUrl('https://127.0.0.1')).toBe(true);
      expect(isUrl('file:///path/to/file')).toBe(true);
    });
  });
});
